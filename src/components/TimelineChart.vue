<template>
  <g :transform="`translate(${margin.left}, ${margin.top})`">
    <template v-for="period in populatedPeriods">
      <rect
        :id="uuid + '-period-at-' + period.x"
        :key="'rect ' + period.x"
        :x="period.x"
        y="0"
        :width="periodWidth"
        :height="styleConfig.height"
        :class="period.class"
      />

      <b-popover
        v-if="styleConfig.showTooltip"
        :key="'popover ' + period.x"
        :target="uuid + '-period-at-' + period.x"
        triggers="hover"
        placement="bottom"
      >
        <template #title>
          {{ formatMoment(period.moment) }}
        </template>
        {{ period.name | capitalize }} (solar elevation: {{ period.sunAltitude | round2decimals }}°)
      </b-popover>
    </template>
  </g>
</template>

<script lang="ts">
/* eslint-disable vue/require-default-prop */

// TODO: margin.top in the main SVG group seems different than with TimelineChart.vue
import Vue from "vue";
import * as d3 from "d3";
import moment from "moment-timezone";
import { Period } from "../CrowTypes";
import helpers from "../helpers";

interface DisplayablePeriod extends Period {
  x: number;
  class: string;
  name: string;
}

export default Vue.extend({
  filters: {
    capitalize: function (value: string): string {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    },

    round2decimals: function(num: number): string {
      return (Math.round(num * 100) / 100).toFixed(2);
    }
  },
  props: {
    periods: Array as () => Period[], // Each entry: {moment: <moment-tz object>, sunAltitude: <altitude>}
    styleConfig: Object,
    showTimeAs: String
  },
  data: function() {
    return {
      uuid: '',

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
    periodWidth: function(): number {
      return Math.round(this.innerWidth / this.rectDivider);
    },
    dataTemporalResolution: function(): number {
      return moment
        .duration(this.periods[1].moment.diff(this.periods[0].moment))
        .asSeconds();
    },
    rectDivider: function(): number {
      const duration = moment.duration(this.maxMoment.diff(this.minMoment));
      return duration.asSeconds() / this.dataTemporalResolution + 1;
    },
    minMoment: function(): moment.Moment {
      // Now returns a moment obj.
      return this.periods[0].moment;
    },
    maxMoment: function(): moment.Moment {
      return this.periods[this.periods.length - 1].moment;
    },
    maxMomentPlusOne: function(): moment.Moment {
      return this.maxMoment.clone().add(this.dataTemporalResolution, "seconds");
    }
  },
  mounted () {
    this.uuid = helpers.uuidv4();
  },
  methods: {
    formatMoment(m: moment.Moment): string {
      return helpers.formatMoment(
          m,
          this.showTimeAs,
          this.styleConfig.tooltipTimeFormat
        );
    },
    getPeriodClass(sunAltitude: number): string {
      return helpers.makeSafeForCSS(this.getPeriodName(sunAltitude));
    },
    getPeriodName(sunAltitude: number): string {
      if (sunAltitude >= 0) {
        return "day";
      } else if (sunAltitude < 0 && sunAltitude >= -18) {
        return "twilight";
      } else {
        return "night";
      }
    }
  }
});
</script>

<style scoped>
rect.day {
  fill: #ffffff;
}
rect.twilight {
  fill: #486fa3;
}
rect.night {
  fill: #162c54;
}
</style>
