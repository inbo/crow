<template>
  <svg id="new-timeline-chart" :width="svgWidth" :height="svgHeight">
    <g :transform="`translate(${margin.left}, ${margin.top})`">
      <g v-if="styleConfig.showXAxis" transform="translate(0, 25)" v-axis:x="scale" />
      <template v-for="period in populatedPeriods">
        <rect
          :key="'rect ' + period.x"
          :x="period.x"
          y="0"
          :width="periodWidth"
          height="20"
          :class="period.class"
          :id="'period-at-' + period.x"
        />

        <b-popover
          v-if="styleConfig.showTooltip"
          :target="'period-at-' + period.x"
          triggers="hover"
          placement="top"
          :key="'popover ' + period.x"
        >
          <template v-slot:title>{{ formatMoment(period.moment) }}</template>
          <b>Sun altitude:</b>
          {{ period.sunAltitude | round2decimals }}°
          <b>Period</b>
          : {{ period.name }}
        </b-popover>
      </template>
    </g>
  </svg>
</template>

<script>
// TODO: margin.top in the main SVG group seems different than with TimelineChart.vue
import * as d3 from "d3";
import moment from "moment-timezone";
import { timeFormatting } from "./../mixins/timeFormatting.js";
import helpers from "../helpers";

export default {
  mixins: [timeFormatting],
  props: {
    periods: Array, // Each entry: {moment: <moment-tz object>, sunAltitude: <altitude>}
    styleConfig: Object,
    showTimeAs: String
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
  filters: {
    round2decimals: function(num) {
      return (Math.round(num * 100) / 100).toFixed(2);
    }
  },
  methods: {
    getPeriodClass(sunAltitude) {
      return helpers.makeSafeForCSS(this.getPeriodName(sunAltitude));
    },

    getPeriodName(sunAltitude) {
      // TODO: move to helpers?
      if (sunAltitude >= 0) {
        return "day";
      } else if (sunAltitude < 0 && sunAltitude >= -18) {
        return "twilight";
      } else {
        return "night";
      }
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
      // Computed property created just so the "axis" directive can be more easily reused and shared
      return { x: this.xScale, y: null };
    },
    xScale: function() {
      return d3
        .scaleTime()
        .domain([this.minMoment.valueOf(), this.maxMomentPlusOne.valueOf()])
        .range([0, this.innerWidth]);
    },
    populatedPeriods: function() {
      const scale = this.xScale;

      return this.periods.map(period => ({
        ...period,
        x: Math.round(scale(period.moment.valueOf())),
        class: this.getPeriodClass(period.sunAltitude),
        name: this.getPeriodName(period.sunAltitude)
      }));
    },
    svgWidth: function() {
      return this.styleConfig.width;
    },
    svgHeight: function() {
      return this.styleConfig.height;
    },
    periodWidth: function() {
      return Math.round(this.innerWidth / this.rectDivider);
    },
    dataTemporalResolution: function() {
      return moment.duration(this.periods[1].moment.diff(this.periods[0].moment)).asSeconds();
    },
    rectDivider: function() {
      let duration = moment.duration(this.maxMoment.diff(this.minMoment));
      return (duration.asSeconds() / this.dataTemporalResolution) + 1;
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

<style scoped>
rect.day {
  fill: #dae9fe;
}
rect.twilight {
  fill: #4771bb;
}
rect.night {
  fill: #1e252d;
}
</style>