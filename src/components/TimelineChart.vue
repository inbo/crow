<template>
  <svg id="new-timeline-chart" :width="svgWidth" :height="svgHeight">
    <g :transform="`translate(${margin.left}, ${margin.top})`">
      <g
          v-if="styleConfig.showXAxis"
          transform="translate(0, 25)"
          v-xaxis="{'scale': xScale, 'timezone': showTimeAs, 'timeAxisFormat': styleConfig.timeAxisFormat}"
        />
         
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

<script lang="ts">
// TODO: margin.top in the main SVG group seems different than with TimelineChart.vue
import Vue from "vue";
import * as d3 from "d3";
import moment from "moment-timezone";
import { timeFormatting } from "./../mixins/timeFormatting.js";
import { Period } from "../PeriodInterface"
import helpers from "../helpers";

interface DisplayablePeriod extends Period {
  x: number,
  class: string,
  name: string
}

export default Vue.extend({
  mixins: [timeFormatting],
  props: {
    periods: Array as () => Period[], // Each entry: {moment: <moment-tz object>, sunAltitude: <altitude>}
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
    round2decimals: function(num: number) {
      return (Math.round(num * 100) / 100).toFixed(2);
    }
  },
  methods: {
    getPeriodClass(sunAltitude: number) {
      return helpers.makeSafeForCSS(this.getPeriodName(sunAltitude));
    },

    getPeriodName(sunAltitude: number) {
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
    xaxis(el, binding, vnode) {
      // TODO: code copy/pasted from VPChart. Possible to factorize (without mixins)? Or isn't it worth it?
      const scaleFunction = binding.value.scale;
      const showTimeAs = binding.value.timezone;
      const timeAxisFormat = binding.value.timeAxisFormat;

      let d3Axis = d3
        .axisBottom<number>(scaleFunction)
        .ticks(7)
        .tickFormat(d => {
          return helpers.formatTimestamp(d, showTimeAs, timeAxisFormat);
        });

      d3Axis(d3.select((el as unknown) as SVGGElement)); // TODO: TS: There's probably a better solution than this double casting
    }
  },

  computed: {
    xScale: function(): d3.ScaleTime<number, number> {
      return d3
        .scaleTime()
        .domain([this.minMoment.valueOf(), this.maxMomentPlusOne.valueOf()])
        .range([0, this.innerWidth]);
    }, 
    populatedPeriods: function(): DisplayablePeriod[] {
      const scale = this.xScale;

      return this.periods.map(period => ({
        ...period,
        x: Math.round(scale(period.moment.valueOf())),
        class: this.getPeriodClass(period.sunAltitude),
        name: this.getPeriodName(period.sunAltitude)
      }));
    },
    svgWidth: function(): number {
      return this.styleConfig.width;
    },
    svgHeight: function():number {
      return this.styleConfig.height;
    },
    periodWidth: function():number {
      return Math.round(this.innerWidth / this.rectDivider);
    },
    dataTemporalResolution: function():number {
      return moment.duration(this.periods[1].moment.diff(this.periods[0].moment)).asSeconds();
    },
    rectDivider: function():number {
      let duration = moment.duration(this.maxMoment.diff(this.minMoment));
      return (duration.asSeconds() / this.dataTemporalResolution) + 1;
    },
    minMoment: function():moment.Moment {
      // Now returns a moment obj.
      return this.periods[0].moment;
    },
    maxMoment: function(): moment.Moment {
      return this.periods[this.periods.length - 1].moment;
    },
    maxMomentPlusOne: function(): moment.Moment {
      return this.maxMoment.clone().add(this.dataTemporalResolution, "seconds");
    }
  }
});
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