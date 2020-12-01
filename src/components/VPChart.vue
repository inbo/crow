<template>
  <div>
    <slot name="header" />
    <b-form inline>
      <b-form-group
        id="vp-color-scheme-group"
        label="Colour scale:"
        label-for="vp-color-scheme"
      >
        <b-form-select
          id="vp-color-scheme"
          v-model="selectedColorSchemeIdentifier"
          size="sm"
          class="mx-3"
          :options="availableColorSchemes"
        />
      </b-form-group>
      <color-legend
        :color-scale="selectedColorSchemeConfig.colorScale"
        :color-scale-type="selectedColorSchemeConfig.colorScaleType"
        :max-density="maxDensity"
        opacity="1"
        topic="Density"
      />
    </b-form>

    <svg 
      id="vp-chart" 
      :width="styleConfig.width" 
      :height="styleConfig.height"
    >
      <g :transform="`translate(${margin.left}, ${margin.top})`">
        <g :transform="`translate(0, ${innerHeight})`">
          <slot name="in-x-axis-group" />
          <g
            v-xaxis="{'scale': xScale, 'timezone': showTimeAs, 'axisTimeFormat': styleConfig.axisTimeFormat}"
          />
        </g>
        <g v-yaxis-left="{'scale': yScale, 'tickValues': styleConfig.yAxisLeftTicks}" />

        <template v-for="d in vtpsDataPrepared">
          <rect
            :id="'rect-' + d.timestamp + '-' + d.height"
            :key="'rect-' + d.timestamp + '-' + d.height"
            :x="d.x"
            :y="d.y"
            :fill="d.fill"
            :height="rectHeight"
            :width="rectWidth"
          />

          <b-popover
            v-if="styleConfig.showTooltip"
            :key="'popover-' + d.timestamp + '-' + d.height"
            :target="'rect-' + d.timestamp + '-' + d.height"
            triggers="hover"
            placement="top"
          >
            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #title>{{ formatTimestampForTooltip(d.timestamp) }}</template>
            <b>Height</b>
            {{ d.height }}m
            <br />
            <b>Density</b>
            {{ d.dens }}
          </b-popover>
        </template>

        <g 
          v-yaxis-right="{'scale': yScaleFeet }" 
          :transform="`translate(${innerWidth}, 0)`" 
        />

        <text
          text-anchor="end"
          transform="rotate(-90)"
          :y="-margin.left + 20"
          :x="-margin.top - 70"
        >Height (meters)</text>
        <text
          text-anchor="end"
          transform="rotate(-90)"
          :y="innerWidth + 55"
          :x="margin.top - 70"
        >Height (feet)</text>

        <daily-lines
          :days="daysCovered"
          :height="innerHeight"
          :color="selectedColorSchemeConfig.dailyLinesColor"
        />
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
/* eslint-disable vue/require-default-prop */

// TODO: create a single popover for performance reasons?
import Vue from "vue";
import * as d3 from "d3";
import helpers from "../helpers";
import DailyLines from "./DailyLines.vue";
import ColorLegend from "./ColorLegend.vue";
import moment, { Moment } from "moment-timezone";
import {
  ColorSchemeIdentifier,
  VTPSEntry,
  DayData,
  ColorSchemeConfigEntry,
} from "../CrowTypes";

interface Scales {
  x: d3.ScaleTime<number, number>; // TODO: check number number is correct (multiple generic types)
  y: null;
}

interface VTPSEntryPrepared extends VTPSEntry {
  // Data, once ready for display
  x: number;
  y: number | undefined;
  fill: string;
}

export default Vue.extend({
  name: "VPChart",
  components: {
    DailyLines,
    ColorLegend,
  },
  directives: {
    yaxisRight(el, binding): void {
      const scaleFunction = binding.value.scale;

      const d3Axis = d3
        .axisRight<number>(scaleFunction)
        .tickSizeOuter(0)
        .tickFormat(d3.format("d"));

      d3Axis(d3.select((el as unknown) as SVGGElement)); // TODO: TS: There's probably a better solution than this double casting
    },
    yaxisLeft(el, binding): void {
      const scaleFunction = binding.value.scale;
      const tickValues = binding.value.tickValues;

      const d3Axis = d3
        .axisLeft(scaleFunction)
        .tickValues(tickValues)
        .tickSizeOuter(0); // And we want to hide the last tick line

      d3Axis(d3.select((el as unknown) as SVGGElement)); // TODO: TS: There's probably a better solution than this double casting
    },
    xaxis(el, binding): void {
      const scaleFunction = binding.value.scale;
      const showTimeAs = binding.value.timezone;
      const axisTimeFormat = binding.value.axisTimeFormat;

      const d3Axis = d3
        .axisBottom<number>(scaleFunction)
        .ticks(7)
        .tickSize(15)
        .tickFormat((d) => {
          return helpers.formatTimestamp(d, showTimeAs, axisTimeFormat);
        });

      d3Axis(d3.select((el as unknown) as SVGGElement)); // TODO: TS: There's probably a better solution than this double casting
    },
  },
  props: {
    vtpsData: Array as () => VTPSEntry[],
    styleConfig: Object,
    scheme: String as () => ColorSchemeIdentifier,
    showTimeAs: String, // "UTC" or a TZ database entry (such as "Europe/Brussels")
  },
  data: function () {
    return {
      margin: this.styleConfig.margin,

      selectedColorSchemeIdentifier: this.scheme as ColorSchemeIdentifier,

      availableColorSchemes: [
        {
          // TODO: decide which exact sequential scale (linear, log, symlog, sqrt, ... ) is more appropriate: https://observablehq.com/@d3/sequential-scales
          text: "Viridis",
          value: "viridis",
          dailyLinesColor: "white",
          colorScale: d3.scaleSequentialSymlog(d3.interpolateViridis),
          dynamicDomain: true,
          colorScaleType: "sequential",
        },

        {
          // TODO: decide which exact sequential scale (linear, log, symlog, sqrt, ... ) is more appropriate: https://observablehq.com/@d3/sequential-scales
          text: "bioRad",
          value: "biorad",
          dailyLinesColor: "red",
          colorScale: d3.scaleSequentialSymlog(helpers.interpolateBioRad),
          dynamicDomain: true,
          colorScaleType: "sequential",
        },

        {
          text: "BirdTAM",
          value: "birdtam",
          dailyLinesColor: "green",
          colorScale: d3
            .scaleOrdinal<number, string>()
            // BIRDTAM RGB-kleuren = [1 1 1; .9 1 .9; .8 1 .8; .7 1 .7; .6 1 .6; 0 1 0; 1 1 0; 1 .7 .7; 1 0 0; .2 .2 .2;];
            .range(this.styleConfig.birdtamColors.values())
            .domain(this.styleConfig.birdtamColors.keys()),
          dynamicDomain: false,
          dataPreprocessor: helpers.densityToBirdtam,
          colorScaleType: "ordinal",
        },
      ] as ColorSchemeConfigEntry[],

      innerWidth:
        this.styleConfig.width -
        this.styleConfig.margin.left -
        this.styleConfig.margin.right,

      innerHeight:
        this.styleConfig.height -
        this.styleConfig.margin.top -
        this.styleConfig.margin.bottom,
    };
  },
  computed: {
    selectedColorSchemeConfig: function (): ColorSchemeConfigEntry {
      const found = this.availableColorSchemes.find(
        (e) => e.value === this.selectedColorSchemeIdentifier
      );

      return found ? found : this.availableColorSchemes[0];
    },
    daysCovered: function (): DayData[] {
      const days = this.getDaysInRange(
        this.minTimestamp,
        this.maxTimestamp,
        this.showTimeAs
      );

      return days.map((mom) => {
        return {
          moment: mom,
          xPositionAtMidnight: this.xScale(mom.valueOf()),
          dayLabel: mom.format("MMM DD"),
        };
      });
    },
    rectHeight: function (): number {
      return this.innerHeight / this.distinctHeightsMeters.length;
    },
    rectWidth: function (): number {
      return Math.round(this.innerWidth / this.rectDivider);
    },
    rectDivider: function (): number {
      const durationInMs = this.maxTimestamp - this.minTimestamp;
      return durationInMs / 1000 / this.dataTemporalResolution + 1;
    },
    minTimestamp: function (): number {
      const minVal = d3.min(this.vtpsData, function (d: VTPSEntry) {
        return d.timestamp;
      });
      return minVal || 0;
    },
    maxTimestamp: function (): number {
      const maxVal = d3.max(this.vtpsData, function (d: VTPSEntry) {
        return d.timestamp;
      });
      return maxVal || 0;
    },
    maxDensity: function (): number {
      const maxVal = d3.max(this.vtpsData, function (d) {
        return d.dens;
      });
      return maxVal || 0;
    },
    dataTemporalResolution: function (): number {
      return (this.vtpsData[26].timestamp - this.vtpsData[0].timestamp) / 1000; // TODO: replace 26 by dynamic value
    },
    distinctHeightsMeters: function (): number[] {
      const heightsSet = new Set(this.vtpsData.map((row) => row.height));
      return Array.from(heightsSet.values());
    },
    scale: function (): Scales {
      // Computed property created just so the "axis" directive can be more easily reused and shared
      return { x: this.xScale, y: null };
    },
    xScale: function (): d3.ScaleTime<number, number> {
      return d3
        .scaleTime()
        .domain([
          this.minTimestamp,
          this.maxTimestamp + this.dataTemporalResolution * 1000,
        ])
        .range([0, this.innerWidth]);
    },
    yScale: function (): d3.ScalePoint<string> {
      return d3
        .scalePoint()
        .range([this.innerHeight, 0])
        .domain(this.distinctHeightsMeters.concat([5000]).map(String)); // The axis needs one more value so the line extends to the top...
    },
    yScaleFeet: function (): d3.ScaleLinear<number, number> {
      return d3
        .scaleLinear()
        .range([this.innerHeight, 0])
        .domain([0, 15748.03]); // TODO: make dynamic
    },
    vtpsDataPrepared: function (): VTPSEntryPrepared[] {
      return this.vtpsData.map((data) => ({
        ...data,

        x: Math.round(Math.round(this.xScale(data.timestamp)) + 1),
        y: this.getRectYValue(data.height),
        fill: this.getRectColor(data),
      }));
    },
  },
  watch: {
    selectedColorSchemeIdentifier: function (newScheme): void {
      this.$emit("color-scheme-changed", newScheme);
    },
  },
  methods: {
    getDaysInRange: function (
      startTimestamp: number,
      stopTimestamp: number,
      timezone: string
    ): Moment[] {
      const startDate = new Date(startTimestamp);
      const stopDate = new Date(stopTimestamp);

      const momentArray = [];
      let currentMoment = moment(startDate);
      const stopMoment = moment(stopDate);
      while (currentMoment <= stopMoment) {
        momentArray.push(currentMoment.clone().tz(timezone).startOf("day"));
        currentMoment = currentMoment.clone().add(1, "days");
      }
      return momentArray;
    },
    formatTimestampForTooltip: function (ts: number): string {
      return helpers.formatTimestamp(
        ts,
        this.showTimeAs,
        this.styleConfig.tooltipTimeFormat
      );
    },
    formatTimestamp: function (ts: number): string {
      return helpers.formatTimestamp(
        ts,
        this.showTimeAs,
        this.styleConfig.axisTimeFormat
      );
    },
    getRectYValue: function (height: number): number {
      const scaledValue = this.yScale(height.toString());
      if (scaledValue) {
        return scaledValue - this.rectHeight;
      } else {
        // We've asked yScale for a value outside of the domain, log error?
        return 0;
      }
    },
    getRectColor: function (data: VTPSEntry): string {
      let color;
      const config = this.selectedColorSchemeConfig;

      if (data.noData) {
        color = this.styleConfig.noDataColor;
      } else {
        // We have proper data for this rectangle

        // For some schemes, the density data has to be preprocessed:
        const density = config.dataPreprocessor
          ? config.dataPreprocessor(data.dens)
          : data.dens;

        let scale = config.colorScale;
        if (config.dynamicDomain) {
          // @ts-ignore: several TS issues, we assume it's because outdated D3 definitions
          scale = scale.domain([0, this.maxDensity]).nice();
        }
        color = scale(density);
      }

      return color;
    },
  },
});
</script>