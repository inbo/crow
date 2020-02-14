<template>
  <div>
    <slot name="title"></slot>
    <b-form>
      <b-form-row>
        <b-col cols="3">
          <b-form-group id="vpi-display-mode-group" label="Show:" label-for="vpi-display-mode">
            <b-form-select
              id="vpi-display-mode"
              size="sm"
              v-model="selectedMode"
              :options="availableModes"
              value-field="propertyName"
              text-field="label"
            ></b-form-select>
          </b-form-group>
        </b-col>
      </b-form-row>
    </b-form>

    <div id="ignore-mouse-events" style="pointer-events:none;"></div>

    <svg id="new-vpi-chart" :width="styleConfig.width" :height="styleConfig.height">
      <g :transform="`translate(${margin.left}, ${margin.top})`">
        <!-- X axis -->
        <g
          :transform="`translate(0, ${this.innerHeight})`"
          v-xaxis="{'scale': xScale, 'timezone': showTimeAs, 'timeAxisFormat': styleConfig.timeAxisFormat}"
        />

        <!-- Y axis -->
        <g v-yaxis="{'scale': yScale}" />

        <!-- Y axis legend -->
        <text
          text-anchor="middle"
          transform="rotate(-90)"
          :y="-margin.left + 20"
          :x="-margin.top - 110"
        >{{ selectedModeLabel }}</text>

        <!-- tooltip -->
        <template v-if="styleConfig.showTooltip">
          <rect
            style="visibility: hidden"
            pointer-events="all"
            @mousemove="mouseMove"
            @mouseenter="mouseEnter"
            @mouseleave="mouseLeave"
            :width="innerWidth"
            :height="innerHeight"
          />
          <circle
            v-show="tooltipVisible"
            style="pointer-events:none;"
            id="tooltipCircle"
            :cx="closestMomentXPosition"
            :cy="YPositionAtTimeX"
            r="4"
            :style="`fill: ${styleConfig.lineColor} `"
          />

          <b-popover container="ignore-mouse-events" :show.sync="tooltipVisible" target="tooltipCircle" placement="top">
            <template v-slot:title>{{ formattedMomentAtTimeX }}</template>
            <div><b>{{ selectedModeLabel }}: {{ selectedValAtTimeX | round2decimals }}</b></div>
          </b-popover>
        </template>

        <!-- finally, the chart line -->
        <path fill="none" style="pointer-events:none;" :stroke="styleConfig.lineColor" stroke-width="1.5" :d="pathData" />
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import * as d3 from "d3";
import moment from "moment-timezone";

import helpers from "../helpers";

type integratedPropertyName = "mtr" | "rtr" | "vid" | "vir";
type NullableNumber = number | null;
type NullableVPIEntry = VPIEntry | null;

interface Profiles {
  mtr: number;
  rtr: number;
  vid: number;
  vir: number;
}

interface VPIEntry {
  // Data, as received via props
  moment: moment.Moment;
  integratedProfiles: Profiles;
}

interface DisplayMode {
  propertyName: integratedPropertyName; // the name of the property (on vpiData[].integratedProfiles) where data can be found. Can be used as an ID
  label: string; // appears in <select> and as legend of the Y axis
  yMaxValComputedName: "maxMTRWithMinimum" | "maxRTR" | "maxVID" | "maxVIR"; // the name of a computed property to get the max value for the Y Axis
}

export default Vue.extend({
  name: "VPIChart",
  props: {
    vpiData: Array as () => VPIEntry[],
    styleConfig: Object,
    showTimeAs: String, // "UTC" or a TZ database entry (such as "Europe/Brussels")
    dataTemporalResolution: Number
  },
  data: function() {
    return {
      selectedMode: "mtr" as integratedPropertyName,
      availableModes: [
        {
          label: "Migration Traffic Rate",
          propertyName: "mtr",
          yMaxValComputedName: "maxMTRWithMinimum"
        },
        {
          label: "Reflectivity traffic rate",
          propertyName: "rtr",
          yMaxValComputedName: "maxRTR"
        },
        {
          label: "Vertically integrated density",
          propertyName: "vid",
          yMaxValComputedName: "maxVID"
        },
        {
          label: "Vertically integrated reflectivity",
          propertyName: "vir",
          yMaxValComputedName: "maxVIR"
        }
      ] as DisplayMode[],

      margin: this.styleConfig.margin,

      tooltipVisible: false,

      // For tooltip: those will be null if the mouse is *not* over the chart
      // See also computed properties: selectedValAtTimeX and YPositionAtTimeX
      mouseXPosition: null as NullableNumber, // in pixels, 0 is left border of the graph
      VPIEntryAtTimeX: null as NullableVPIEntry,

      momentBisector: d3.bisector(function(d: VPIEntry) {
        return d.moment.valueOf();
      }).left,

      innerWidth:
        this.styleConfig.width -
        this.styleConfig.margin.left -
        this.styleConfig.margin.right,
      innerHeight:
        this.styleConfig.height -
        this.styleConfig.margin.top -
        this.styleConfig.margin.bottom
    };
  },
  filters: {
    round2decimals: function(num: number): string {
      return (Math.round(num * 100) / 100).toFixed(2);
    },
  },
  methods: {
    mouseEnter() {
      this.tooltipVisible = true;
      this.mouseXPosition = 0;
    },
    mouseLeave() {
      this.tooltipVisible = false;
      this.mouseXPosition = null;
    },
    mouseMove(event: MouseEvent) {
      // When mouse is moved over the chart, updates this.mouseXPosition and this.VPIEntryAtTimeX
      let target = event.target as HTMLElement;
      let bounds = target.getBoundingClientRect();
      this.mouseXPosition = event.clientX - bounds.left;

      let x0 = this.xScale.invert(this.mouseXPosition);

      let i = this.momentBisector(this.vpiData, x0, 1);
      let d0 = this.vpiData[i - 1];
      let d1 = this.vpiData[i];
      let d =
        x0.getTime() / 1000 - d0.moment.valueOf() >
        d1.moment.valueOf() - x0.getTime() / 1000
          ? d1
          : d0;

      this.VPIEntryAtTimeX = d;
    }
  },
  directives: {
    yaxis(el, binding, vnode) {
      const scaleFunction = binding.value.scale;

      let d3Axis = d3.axisLeft(scaleFunction).tickSizeOuter(0); // And we want to hide the last tick line

      d3Axis(d3.select((el as unknown) as SVGGElement)); // TODO: TS: There's probably a better solution than this double casting
    },
    xaxis(el, binding, vnode) {
      // TODO: code copy/pasted from VPChart. Possible to factorize (without mixins)? Or isn't it worth it?
      const scaleFunction = binding.value.scale;
      const showTimeAs = binding.value.timezone;
      const timeAxisFormat = binding.value.timeAxisFormat;

      let d3Axis = d3
        .axisBottom(scaleFunction)
        .ticks(7)
        .tickFormat(d => {
          return helpers.formatTimestamp(d, showTimeAs, timeAxisFormat);
        });

      d3Axis(d3.select((el as unknown) as SVGGElement)); // TODO: TS: There's probably a better solution than this double casting
    }
  },
  computed: {
    formattedMomentAtTimeX: function(): string {
      if (this.VPIEntryAtTimeX) {
        return helpers.formatMoment(this.VPIEntryAtTimeX.moment, this.showTimeAs, this.styleConfig.timeAxisFormat);
      }
      return ''
    },
    YPositionAtTimeX: function(): number | null {
      if (this.selectedValAtTimeX) {
        return this.yScale(this.selectedValAtTimeX);
      }
      return null;
    },
    selectedValAtTimeX: function(): number | null {
      if (this.VPIEntryAtTimeX) {
        return this.VPIEntryAtTimeX.integratedProfiles[
          this.selectedModePropertyName
        ];
      }
      return null;
    },
    closestMomentXPosition: function(): number | null {
      if (this.VPIEntryAtTimeX) {
        return this.xScale(this.VPIEntryAtTimeX.moment.valueOf());
      }
      return null;
    },
    maxVID: function(): number {
      let max = d3.max(this.vpiData, function(d) {
        return d.integratedProfiles.vid;
      });
      return max || 0;
    },
    maxVIR: function(): number {
      let max = d3.max(this.vpiData, function(d) {
        return d.integratedProfiles.vir;
      });
      return max || 0;
    },
    maxMTR: function(): number {
      let max = d3.max(this.vpiData, function(d) {
        return d.integratedProfiles.mtr;
      });
      return max || 0;
    },
    maxRTR: function(): number {
      let max = d3.max(this.vpiData, function(d) {
        return d.integratedProfiles.rtr;
      });
      return max || 0;
    },
    maxMTRWithMinimum: function(): number {
      // If the maximum MTR is small, we return 50 so a small peak on a very calm day doesn't seem huge
      if (this.maxMTR < 50) {
        return 50;
      } else {
        return this.maxMTR;
      }
    },
    yMaxVal: function(): number {
      return this[this.selectedModeObject.yMaxValComputedName];
    },
    selectedModePropertyName: function(): integratedPropertyName {
      return this.selectedModeObject.propertyName;
    },
    selectedModeLabel: function(): string {
      return this.selectedModeObject.label;
    },
    selectedModeObject: function(): DisplayMode {
      let found = this.availableModes.find(
        d => d.propertyName == this.selectedMode
      );
      return found || this.availableModes[0]; // Default: first entry
    },
    minMoment: function(): moment.Moment {
      let foundMoment = d3.min(this.vpiData, function(d) {
        return d.moment;
      });
      return foundMoment || moment();
    },
    maxMoment: function(): moment.Moment {
      let foundMoment = d3.max(this.vpiData, function(d) {
        return d.moment;
      });
      return foundMoment || moment();
    },
    maxMomentPlusOne: function(): moment.Moment {
      // TODO: duplicate code in other charts ! Mixin? Helper?
      return this.maxMoment.clone().add(this.dataTemporalResolution, "seconds");
    },
    xScale: function(): d3.ScaleTime<number, number> {
      return d3
        .scaleTime()
        .domain([this.minMoment.valueOf(), this.maxMomentPlusOne.valueOf()])
        .range([0, this.innerWidth]);
    },
    yScale: function(): d3.ScaleLinear<number, number> {
      return d3
        .scaleLinear()
        .range([this.innerHeight, 0])
        .domain([0, this.yMaxVal]);
    },
    pathData: function(): string | null {
      const path = d3
        .line<VPIEntry>()
        .x(vpiEntry => {
          return this.xScale(vpiEntry.moment.valueOf());
        })
        .y(vpiEntry => {
          let rawValue =
            vpiEntry.integratedProfiles[this.selectedModePropertyName];
          return this.yScale(isNaN(rawValue) ? 0 : rawValue);
        });

      return path(this.vpiData);
    }
  }
});
</script>