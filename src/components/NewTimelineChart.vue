<template>
  <svg id="new-timeline-chart" :width="svgWidth" :height="svgHeight">
    <g :transform="`translate(${margin.left}, ${margin.top})`">
      <g transform="translate(0, 25)" v-axis:x="scale" />
      <rect
        v-for="period in populatedPeriods"
        :key="period.moment.valueOf()"
        :x="period.x"
        y="0"
        :width="periodWidth"
        height="20"
        :style="`fill: ${period.color};`"
      />
    </g>
  </svg>
</template>

<script>
// TODO: margin.top in the main SVG group seems different than with TimelineChart.vue
// TODO: try with a class and scoped styles instead of hardcoding the color

import * as d3 from "d3";
import moment from "moment-timezone";
import { timeFormatting } from "./../mixins/timeFormatting.js";

export default {
  mixins: [timeFormatting],  
  props: {
    periods: Array, // Each entry: {moment: <moment-tz object>, sunAltitude: <altitude>}
    styleConfig: Object,
    dataTemporalResolution: Number, // TODO: automatically infer from data?
    showTimeAs: String
  },
  data: function() {
    return {
      margin: this.styleConfig.margin,

      // TODO: rename innerWidth
      width:
        this.styleConfig.width -
        this.styleConfig.margin.left -
        this.styleConfig.margin.right,
      // TODO: rename innerHeight
      height:
        this.styleConfig.height -
        this.styleConfig.margin.top -
        this.styleConfig.margin.bottom
    };
  },
  methods: {
    getPeriodFillColor(sunAltitude) {
      return this.getPeriodData(sunAltitude).color;
    },
    getPeriodData(sunAltitude) {
      let style = this.styleConfig;

      let color;
      let name;

      if (sunAltitude >= 0) {
        color = style.dayColor;
        name = "day";
      } else if (sunAltitude < 0 && sunAltitude >= -18) {
        color = style.twilightColor;
        name = "twilight";
      } else {
        color = style.nightColor;
        name = "night";
      }

      return {
        color: color,
        name: name
      };
    }
  },

  directives: {
    axis(el, binding, vnode) {
      // Approach taken from: https://stackoverflow.com/questions/48726636/draw-d3-axis-without-direct-dom-manipulation
      const axis = binding.arg;
      const axisMethod = { x: "axisBottom", y: "axisLeft" }[axis];
      const methodArg = binding.value[axis];

      let vm = vnode.context;

      let d3Axis = d3[axisMethod](methodArg)
        .ticks(7)
        .tickFormat(d => {
          return vm.formatTimestamp(d);
        });

      d3.select(el).call(d3Axis);
    }
  },

  computed: {
    scale: function() {
      // Computed property added just so the "axis" directive can be more easily reused and shared
      return { x: this.xScale, y: null };
    },
    xScale: function() {
      return d3
        .scaleTime()
        .domain([this.minMoment.valueOf(), this.maxMomentPlusOne.valueOf()])
        .range([0, this.width]);
    },
    populatedPeriods: function() {
      const scale = this.xScale;

      return this.periods.map(period => ({
        ...period,
        x: Math.round(scale(period.moment.valueOf())),
        color: this.getPeriodFillColor(period.sunAltitude)
      }));
    },
    svgWidth: function() {
      return this.styleConfig.width;
    },
    svgHeight: function() {
      return this.styleConfig.height;
    },
    periodWidth: function() {
      return Math.round(this.width / this.rectDivider);
    },
    rectDivider: function() {
      let duration = moment.duration(this.maxMoment.diff(this.minMoment));
      return duration.asSeconds() / this.dataTemporalResolution;
    },
    minMoment: function() {
      // Now returns a moment obj.
      return this.periods[0].moment;
    },
    maxMoment: function() {
      return this.periods[this.periods.length - 1].moment;
    },
    maxMomentPlusOne: function() {
      return this.maxMoment.clone().add(this.dataTemporalResolution, "seconds");
    }
  }
};
</script>