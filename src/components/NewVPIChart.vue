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
            :cx="mouseXPosition"
            r="4"
            :style="`fill: ${styleConfig.lineColor} `"
          />
        </template>

        <!-- finally, the chart line -->
        <path fill="none" :stroke="styleConfig.lineColor" stroke-width="1.5" :d="pathData" />
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
  name: "NewVPIChart",
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

      mouseXPosition: null as NullableNumber, // If the mouse is over the chart

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
      let target = event.target as HTMLElement;
      let bounds = target.getBoundingClientRect();
      let x = event.clientX - bounds.left;
      let y = event.clientY - bounds.top;

      // x and y are now relative to the topleft corner of the graph
      this.mouseXPosition = x;
      //console.log(x, y);
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