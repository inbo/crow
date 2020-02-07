<template>
  <div>
    <slot name="title"></slot>
    <svg id="vp-chart" :width="styleConfig.width" :height="styleConfig.height">
      <g :transform="`translate(${margin.left}, ${margin.top})`">
        <rect v-for="d in vtpsDataPrepared" :key="d.timestamp + '-' + d.height" />
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import * as d3 from "d3";

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
  x: Number;
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
  methods: {},
  computed: {
    minTimestamp: function(): number {
      let min = d3.min(this.vtpsData, function(d: VTPSEntry) {
        return d.timestamp;
      });
      return min || 0;
    },
    maxTimestamp: function(): number {
      let max = d3.max(this.vtpsData, function(d: VTPSEntry) {
        return d.timestamp;
      });
      return max || 0;
    },
    dataTemporalResolution: function(): number {
      return (this.vtpsData[26].timestamp - this.vtpsData[0].timestamp) / 1000;
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
    vtpsDataPrepared: function(): VTPSEntryPrepared[] {
      return this.vtpsData.map(data => ({
        ...data,

        x: Math.round(Math.round(this.xScale(data.timestamp)) + 1)

        /*class: this.getPeriodClass(period.sunAltitude),
        name: this.getPeriodName(period.sunAltitude)*/
      }));
    }
  }
});
</script>