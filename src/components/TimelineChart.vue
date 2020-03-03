<template>
  <g :transform="`translate(${margin.left}, ${margin.top})`">
    <template v-for="period in populatedPeriods">
      <rect
        :key="'rect ' + period.x"
        :x="period.x"
        y="0"
        :width="periodWidth"
        :height="styleConfig.height"
        :class="period.class"
        :id="uuid + '-period-at-' + period.x"
      />

      <b-popover
        v-if="styleConfig.showTooltip"
        :target="uuid + '-period-at-' + period.x"
        triggers="hover"
        placement="bottom"
        :key="'popover ' + period.x"
      >
        <template v-slot:title>{{ formatMoment(period.moment) }}</template>
        Sun altitude:
        {{ period.sunAltitude | round2decimals }}°<br/>
        Period
        : {{ period.name }}
      </b-popover>
    </template>
  </g>
</template>

<script lang="ts">
// TODO: margin.top in the main SVG group seems different than with TimelineChart.vue
import Vue from "vue";
import * as d3 from "d3";
import moment, { Moment } from "moment-timezone";
import { Period } from "../PeriodInterface";
import helpers from "../helpers";

interface DisplayablePeriod extends Period {
  x: number;
  class: string;
  name: string;
}

export default Vue.extend({
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
  filters: {
    round2decimals: function(num: number) {
      return (Math.round(num * 100) / 100).toFixed(2);
    }
  },
  methods: {
    formatMoment(m: moment.Moment): string {
      return helpers.formatMoment(
          m,
          this.showTimeAs,
          this.styleConfig.tooltipTimeFormat
        );
    },
    getPeriodClass(sunAltitude: number) {
      return helpers.makeSafeForCSS(this.getPeriodName(sunAltitude));
    },
    getPeriodName(sunAltitude: number) {
      if (sunAltitude >= 0) {
        return "day";
      } else if (sunAltitude < 0 && sunAltitude >= -18) {
        return "twilight";
      } else {
        return "night";
      }
    }
  },
  mounted () {
    this.uuid = helpers.uuidv4();
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
      let duration = moment.duration(this.maxMoment.diff(this.minMoment));
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
  }
});
</script>

<style scoped>
rect.day {
  fill: #afbbc0;
}
rect.twilight {
  fill: #486fa3;
}
rect.night {
  fill: #162c54;
}
</style>