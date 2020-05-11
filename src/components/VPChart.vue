<template>
  <div>
    <slot name="title" />
    <b-form>
      <b-form-row>
        <b-col cols="3">
          <b-form-group
            id="vp-color-scheme-group"
            label="Color scheme:"
            label-for="vp-color-scheme"
          >
            <b-form-select
              id="vp-color-scheme"
              v-model="colorScheme"
              size="sm"
              :options="availableColorSchemes"
            />
          </b-form-group>
        </b-col>
      </b-form-row>
    </b-form>
    <color-legend 
      :color-scale="viridisColorScale" 
      opacity="1" 
      topic="Density" 
    />
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
            <template v-slot:title>{{ formatTimestampForTooltip(d.timestamp) }}</template>
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
import { ColorScheme,VTPSEntry, DayData } from '../CrowTypes';

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
    ColorLegend
  },
  directives: {
    yaxisRight(el, binding): void {
      const scaleFunction = binding.value.scale;

      const d3Axis = 
        d3.axisRight<number>(scaleFunction)
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
        .tickFormat(d => {
          return helpers.formatTimestamp(d, showTimeAs, axisTimeFormat);
        });

      d3Axis(d3.select((el as unknown) as SVGGElement)); // TODO: TS: There's probably a better solution than this double casting
    }
  },
  props: {
    vtpsData: Array as () => VTPSEntry[],
    styleConfig: Object,
    scheme: String as () => ColorScheme,
    showTimeAs: String // "UTC" or a TZ database entry (such as "Europe/Brussels")
  },
  data: function() {
    return {
      margin: this.styleConfig.margin,

      colorScheme: this.scheme as ColorScheme,

      availableColorSchemes: [
        { text: "CROW", value: "custom" },
        //{ text: "BioRad", value: "biorad" },
        { text: "BIRDTAM", value: "birdtam" },
        { text: "Viridis", value: "viridis" }
      ],

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
  computed: {
    daysCovered: function(): DayData[] {
      const days = this.getDaysInRange(this.minTimestamp, this.maxTimestamp, this.showTimeAs);

      return days.map(mom => {
        return {
          moment: mom,
          xPositionAtMidnight: this.xScale(mom.valueOf()),
          dayLabel: mom.format("MMM DD")
        };
      });

    },
    rectHeight: function(): number {
      return this.innerHeight / this.distinctHeightsMeters.length;
    },
    rectWidth: function(): number {
      return Math.round(this.innerWidth / this.rectDivider);
    },
    rectDivider: function(): number {
      const durationInMs = this.maxTimestamp - this.minTimestamp;
      return durationInMs / 1000 / this.dataTemporalResolution + 1;
    },
    minTimestamp: function(): number {
      const minVal = d3.min(this.vtpsData, function(d: VTPSEntry) {
        return d.timestamp;
      });
      return minVal || 0;
    },
    maxTimestamp: function(): number {
      const maxVal = d3.max(this.vtpsData, function(d: VTPSEntry) {
        return d.timestamp;
      });
      return maxVal || 0;
    },
    maxDensity: function(): number {
      const maxVal = d3.max(this.vtpsData, function(d) {
        return d.dens;
      });
      return maxVal || 0;
    },
    dataTemporalResolution: function(): number {
      return (this.vtpsData[26].timestamp - this.vtpsData[0].timestamp) / 1000; // TODO: replace 26 by dynamic value
    },
    distinctHeightsMeters: function(): number[] {
      const heightsSet = new Set(this.vtpsData.map(row => row.height));
      return Array.from(heightsSet.values());
    },
    scale: function(): Scales {
      // Computed property created just so the "axis" directive can be more easily reused and shared
      return { x: this.xScale, y: null };
    },
    xScale: function(): d3.ScaleTime<number, number> {
      return d3
        .scaleTime()
        .domain([
          this.minTimestamp,
          this.maxTimestamp + this.dataTemporalResolution * 1000
        ])
        .range([0, this.innerWidth]);
    },
    yScale: function(): d3.ScalePoint<string> {
      return d3
        .scalePoint()
        .range([this.innerHeight, 0])
        .domain(this.distinctHeightsMeters.concat([5000]).map(String)); // The axis needs one more value so the line extends to the top...
    },
    yScaleFeet: function(): d3.ScaleLinear<number, number> {
      return d3
        .scaleLinear()
        .range([this.innerHeight, 0])
        .domain([0, 15748.03]); // TODO: make dynamic
    },
    birdtamColorScale: function(): d3.ScaleOrdinal<number, string> {
      return d3
        .scaleOrdinal<number, string>()
        // BIRDTAM RGB-kleuren = [1 1 1; .9 1 .9; .8 1 .8; .7 1 .7; .6 1 .6; 0 1 0; 1 1 0; 1 .7 .7; 1 0 0; .2 .2 .2;];
        .range(["#ffffff", "#e5ffe5", "#ccffcc", "#b2ffb2", "#99ff99", "#00ff00", "#ffff00", "#ffb2b2", "#ff0000", "#333333"])
        .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    },
    customColorScale: function(): d3.ScaleLinear<string, string> {
      return d3
        .scaleLinear<string>()
        .range([
          this.styleConfig.minDensityColor,
          this.styleConfig.maxDensityColor
        ])
        .domain([0, this.maxDensity]);
    },
    viridisColorScale: function(): d3.ScaleSequential<string> {
      return d3
        .scaleSequential<string>(d3.interpolateViridis)
        .domain([0, this.maxDensity])
    },
    vtpsDataPrepared: function(): VTPSEntryPrepared[] {
      return this.vtpsData.map(data => ({
        ...data,

        x: Math.round(Math.round(this.xScale(data.timestamp)) + 1),
        y: this.getRectYValue(data.height),
        fill: this.getRectColor(data)
      }));
    }
  },
  watch: {
    colorScheme: function(newScheme): void {
      this.$emit('colorSchemeChanged', newScheme);
    }
  },
  methods: {
    getDaysInRange: function(startTimestamp: number, stopTimestamp: number, timezone: string): Moment[] {
      const startDate = new Date(startTimestamp);
      const stopDate = new Date(stopTimestamp);
      
      const momentArray = [];
      let currentMoment = moment(startDate);
      const stopMoment = moment(stopDate);
      while (currentMoment <= stopMoment) {
        momentArray.push(currentMoment.clone().tz(timezone).startOf('day'))
        currentMoment = currentMoment.clone().add(1, 'days');
    }
    return momentArray;
    },
    formatTimestampForTooltip: function(ts: number): string {
      return helpers.formatTimestamp(ts, this.showTimeAs, this.styleConfig.tooltipTimeFormat);
    },
    formatTimestamp: function(ts: number): string {
      return helpers.formatTimestamp(ts, this.showTimeAs, this.styleConfig.axisTimeFormat);
    },
    getRectYValue: function(height: number): number {
      const scaledValue = this.yScale(height.toString());
      if (scaledValue) {
        return scaledValue - this.rectHeight;
      } else {
        // We've asked yScale for a value outside of the domain, log error?
        return 0;
      }
    },
    getRectColor: function(data: VTPSEntry): string {
      let color;
      const density = data.dens;

      switch (this.colorScheme) {
        case 'custom':
          color = data.noData ? this.styleConfig.noDataColor : this.customColorScale(density);
          break;
        case 'birdtam':
          color = this.birdtamColorScale(helpers.densityToBirdtam(density));
          break;
        case 'viridis':
          color = data.noData ? this.styleConfig.noDataColor : this.viridisColorScale(density);
      }

      return color;
    }
  },
});
</script>