<template>
  <div>
    <slot name="header" />
    <b-form inline>
      <b-form-group
        id="vp-color-scheme-group"
        :label="t('Colour scale:')"
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
        :max-scale-density="maxColorLegendValue"
        :tick-values="selectedColorSchemeConfig.tickValues"
        :number-of-ticks="selectedColorSchemeConfig.numberOfTicks"
        :last-tick-suffix="t(selectedColorSchemeConfig.units)"
        opacity="1"
        topic="Density"
      />
    </b-form>

    <svg 
      id="vp-chart" 
      :width="styleConfig.width" 
      :height="styleConfig.height"
      class="d-block mx-auto"
    >
      <g :transform="`translate(${margin.left}, ${margin.top})`">
        <g :transform="`translate(0, ${innerHeight})`">
          <slot name="in-x-axis-group" />
          <g
            v-xaxis="{'scale': xScale, 'timezone': showTimeAs, 'axisTimeFormat': styleConfig.axisTimeFormat}"
          />
        </g>
        <g v-yaxis-left="{'scale': yScale}" />

        <template v-for="d in vptsDataPrepared">
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
        >{{ t("Height (meters)") }}</text>
        <text
          text-anchor="end"
          transform="rotate(-90)"
          :y="innerWidth + 55"
          :x="-margin.top - 70"
        >{{ t("Height (feet)") }}</text>

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
import helpers from "@/helpers";
import DailyLines from "@/components/DailyLines.vue";
import ColorLegend from "@/components/ColorLegend.vue";
import moment, { Moment } from "moment-timezone";
import {
  ColorSchemeIdentifier,
  VPTSEntry,
  DayData,
  ColorSchemeConfigEntry,
  LangCode,
  MultilanguageStringContainer,
} from "@/CrowTypes";
import { UserChoicesStoreModule } from "@/store/UserChoicesStore";

interface Scales {
  x: d3.ScaleTime<number, number>; // TODO: check <number, number> is correct (multiple generic types)
  y: null;
}

interface VPTSEntryPrepared extends VPTSEntry {
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

      const d3Axis = d3
        .axisLeft<number>(scaleFunction)
        .tickFormat(alt => alt % 1000 === 0 ? alt.toString() : "")
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
    vptsData: Array as () => VPTSEntry[],
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
          text: "Viridis",
          value: "viridis",
          dailyLinesColor: "white",
          colorScale: d3.scaleSequentialSymlog(d3.interpolateViridis),
          dynamicDomain: true,
          colorScaleType: "sequentialSymLog",
          tickValues: null,
          numberOfTicks: 3,
          units: "birds/km³"
        },

        {
          text: "bioRad",
          value: "biorad",
          dailyLinesColor: "red",
          colorScale: d3.scaleSequentialSymlog(helpers.interpolateStdGammaII).domain([1000, 0]),
          dynamicDomain: false,
          colorScaleType: "sequentialSymLog",
          tickValues: [0, 1, 2, 5, 10, 25, 50, 100, 200, 500, 1000],
          numberOfTicks: null,
          units: "birds/km³"
        },

        {
          text: "BirdTAM",
          value: "birdtam",
          dailyLinesColor: "green",
          colorScale: d3
            .scaleOrdinal<number, string>()
            // BIRDTAM RGB-colours = [1 1 1; .9 1 .9; .8 1 .8; .7 1 .7; .6 1 .6; 0 1 0; 1 1 0; 1 .7 .7; 1 0 0; .2 .2 .2;];
            .range(this.styleConfig.birdtamColors.values())
            .domain(this.styleConfig.birdtamColors.keys()),
          dynamicDomain: false,
          dataPreprocessor: helpers.densityToBirdtam,
          colorScaleType: "ordinal",
          tickValues: null,
          numberOfTicks: null,
          units: null
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

      texts: {
        "Colour scale:": {
          en: "Colour scale:",
          fr: "Palette de couleurs :",
          nl: "Kleurenpalet"
        },
        "Height (meters)": {
          en: "Height (meters)",
          fr: "Altitude (mètres)",
          nl: "Hoogte (meter)"
        }, 
        "Height (feet)": {
          en: "Height (feet)",
          fr: "Altitude (pieds)",
          nl: "Hoogte (feet)"
        },
        "birds/km³": {
          en: "birds/km³",
          fr: "oiseaux/km³",
          nl: "vogels/km³"
        }
      } as MultilanguageStringContainer
    };
  },
  computed: {
    selectedLanguageCode(): LangCode {
      return UserChoicesStoreModule.selectedLanguageCode;
    },
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
      const minVal = d3.min(this.vptsData, function (d: VPTSEntry) {
        return d.timestamp;
      });
      return minVal || 0;
    },
    maxTimestamp: function (): number {
      const maxVal = d3.max(this.vptsData, function (d: VPTSEntry) {
        return d.timestamp;
      });
      return maxVal || 0;
    },
    maxColorLegendValue: function(): number {
      // We need a prop for this so it gets updated when data is added to vptsData (and maxDensity is subsequently changed)
      if (this.selectedColorSchemeConfig.dynamicDomain === true) {
        return this.maxDensity
      } else {
        return this.selectedColorSchemeConfig.colorScale.domain().reduce(function (a, b) {return Math.max(a, b)}) // Get the highest value so we support inverted domains (to reverse color scales)
      }
    },
    maxDensity: function (): number {
      const maxVal = d3.max(this.vptsData, function (d) {
        return d.dens;
      });
      return maxVal || 0;
    },
    dataTemporalResolution: function (): number {
      return (this.vptsData[this.distinctHeightsMeters.length + 1].timestamp - this.vptsData[0].timestamp) / 1000;
    },
    dataVerticalResolutionMeters: function(): number {
      return this.distinctHeightsMeters[1] - this.distinctHeightsMeters[0];
    },
    distinctHeightsMeters: function (): number[] {
      const heightsSet = new Set(this.vptsData.map((row) => row.height));
      return Array.from(heightsSet.values());
    },
    distinctHeightsMetersPlusOne: function (): number[] {
      // If distinctHeightsMeters (from data) is [0, 200, ..., 4800], returns [0, 200, ..., 4800, 5000]
      return this.distinctHeightsMeters.concat([this.maxHeightMeters + this.dataVerticalResolutionMeters])
    },
    maxHeightMeters: function(): number {
      return this.distinctHeightsMeters[this.distinctHeightsMeters.length - 1]
    },
    maxHeightFeet: function(): number {
      return 3.2808 * this.maxHeightMeters;
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
        .domain(this.distinctHeightsMetersPlusOne.map(String)) // ... PlusOne: for a nicer ais display
    },
    yScaleFeet: function (): d3.ScaleLinear<number, number> {
      return d3
        .scaleLinear()
        .range([this.innerHeight, 0])
        .domain([0, this.maxHeightFeet]);
    },
    vptsDataPrepared: function (): VPTSEntryPrepared[] {
      return this.vptsData.map((data) => ({
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
    t(stringId: string) {
      return helpers.translateString(stringId, this.selectedLanguageCode, this.texts);
    },
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
    getRectColor: function (data: VPTSEntry): string {
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
          scale = scale.domain([0, this.maxDensity]).nice(); // We could clamp the scale and start the domain at a very small positive value, so log scales can be applied. Not necessary now because the data seems to be better reprensented with a symlog scale
        }
        color = scale(density);
      }

      return color;
    },
  },
});
</script>
