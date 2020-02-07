<template>
  <div>
    <slot name="title"></slot>
    <svg id="vp-chart" :width="styleConfig.width" :height="styleConfig.height">
      <g :transform="`translate(${margin.left}, ${margin.top})`">
        <rect v-for="d in vtpsDataPrepared" :key="d.timestamp + '-' + d.height" 
        :x="d.x"
        :y="d.y"
        :fill="d.fill"
        :height="rectHeight"
        :width="rectWidth"
        />
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { scaleTime, scalePoint, scaleLinear } from "d3-scale";
import { max, min } from "d3-array";

interface Scales {
  x: d3.ScaleTime<number, number>; // TODO: check number number is correct (multiple generic types)
  y: null;
}

interface VTPSEntry {
  dd: number;
  dens: number;
  ff: number;
  height: number;
  noData: boolean;
  sd_vvp: number;
  timestamp: number;
}

interface VTPSEntryPrepared extends VTPSEntry {
  x: number;
  y: number | undefined;
  fill: string
}

export default Vue.extend({
  name: "newvpchart",
  props: {
    vtpsData: Array as () => VTPSEntry[],
    styleConfig: Object
  },
  data: function() {
    return {
      margin: this.styleConfig.margin,

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
    getRectYValue: function(height: number): number {
      const scaledValue = this.yScale(height.toString()); 
      if(scaledValue) {
        return scaledValue - this.rectHeight;
      } else {
        // We've asked yScale for a value outside of the domain, log error?
        return 0;
      }
    },
    getRectColor: function(data: VTPSEntry): string {
      if (data.noData) {
            return this.styleConfig.noDataColor;
          } else {
            return this.colorScale(data.dens);
          }
    }
  },
  computed: {
    rectHeight: function(): number {
      return this.innerHeight / this.distinctHeightsMeters.length;
    },
    rectWidth: function() : number {
      return Math.round(this.innerWidth / this.rectDivider);
    },
    rectDivider: function() : number {
      let durationInMs = this.maxTimestamp - this.minTimestamp;
      return (durationInMs / 1000 / this.dataTemporalResolution) + 1;
    },
    minTimestamp: function(): number {
      let minVal = min(this.vtpsData, function(d: VTPSEntry) {
        return d.timestamp;
      });
      return minVal || 0;
    },
    maxTimestamp: function(): number {
      let maxVal = max(this.vtpsData, function(d: VTPSEntry) {
        return d.timestamp;
      });
      return maxVal || 0;
    },
    maxDensity: function(): number {
      let maxVal = max(this.vtpsData, function(d) {
        return d.dens;
      });
      return maxVal || 0;
    },
    dataTemporalResolution: function(): number {
      return (this.vtpsData[26].timestamp - this.vtpsData[0].timestamp) / 1000; // TODO: replace 26 by dynamic value
    },
    distinctHeightsMeters: function(): number[] {
      let heightsSet = new Set(this.vtpsData.map(row => row.height));
      return Array.from(heightsSet.values());
    },
    scale: function(): Scales {
      // Computed property created just so the "axis" directive can be more easily reused and shared
      return { x: this.xScale, y: null };
    },
    xScale: function(): d3.ScaleTime<number, number> {
      return scaleTime()
        .domain([
          this.minTimestamp,
          this.maxTimestamp + this.dataTemporalResolution * 1000
        ])
        .range([0, this.innerWidth]);
    },
    yScale: function(): d3.ScalePoint<string> {
      return scalePoint()
        .range([this.innerHeight, 0])
        .domain(this.distinctHeightsMeters.concat([5000]).map(String)); // The axis needs one more value so the line extends to the top...
    },
    colorScale: function(): d3.ScaleLinear<string, string> {
      return scaleLinear<string>()
        .range([
          this.styleConfig.minDensityColor,
          this.styleConfig.maxDensityColor
        ])
        .domain([0, this.maxDensity]);
    },
    vtpsDataPrepared: function(): VTPSEntryPrepared[] {
      return this.vtpsData.map(data => ({
        ...data,

        x: Math.round(Math.round(this.xScale(data.timestamp)) + 1),
        y: this.getRectYValue(data.height),
        fill: this.getRectColor(data)
      }));
    }
  }
});
</script>