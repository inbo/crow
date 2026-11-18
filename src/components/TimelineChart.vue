<template>
  <g :transform="`translate(${margin.left}, ${margin.top})`">
    <rect
      v-for="period in populatedPeriods"
      :id="uuid + '-period-at-' + period.x"
      :key="period.x"
      v-b-popover.hover.bottom.body="periodPopover(period)"
      :x="period.x"
      y="0"
      :width="periodWidth"
      :height="styleConfig.height"
      :class="period.class"
    />
  </g>
</template>

<script lang="ts">
/* eslint-disable vue/require-default-prop */

// TODO: margin.top in the main SVG group seems different than with TimelineChart.vue
import { defineComponent, PropType } from "vue";
import { vBPopover } from "bootstrap-vue-next";
import * as d3 from "d3";
import moment from "moment-timezone";
import { LangCode, MultilanguageStringContainer, Period } from "@/CrowTypes";
import helpers from "@/helpers";
import { useUserChoicesStore } from "@/store/UserChoicesStore";

interface DisplayablePeriod extends Period {
  x: number;
  class: string;
  localizedName: string;
}

export default defineComponent({
  directives: {
    bPopover: vBPopover,
  },
  props: {
    periods: { type: Array as PropType<Period[]>, required: true }, // Each entry: {moment: <moment-tz object>, sunAltitude: <altitude>}
    styleConfig: { type: Object, required: true },
    showTimeAs: { type: String, required: true }
  },
  data: function () {
    return {
      uuid: "",

      margin: this.styleConfig.margin,

      innerWidth:
        this.styleConfig.width -
        this.styleConfig.margin.left -
        this.styleConfig.margin.right,

      innerHeight:
        this.styleConfig.height -
        this.styleConfig.margin.top -
        this.styleConfig.margin.bottom,

      texts: {
        'twilight': {
          en: 'twilight',
          fr: 'crépuscule',
          nl: 'schemering'
        },
        'day': {
          en: 'day',
          fr: 'jour',
          nl: 'dag'
        },
        'night': {
          en: 'night',
          fr: 'nuit',
          nl: 'nacht'
        },
        'solar elevation angle': {
          en: 'solar elevation angle',
          fr: "angle d'élévation solaire",
          nl: "zonnestand"
        }
      } as MultilanguageStringContainer
    };
  },
  computed: {
    selectedLanguageCode(): LangCode {
      return useUserChoicesStore().selectedLanguageCode;
    },
    xScale: function (): d3.ScaleTime<number, number> {
      return d3
        .scaleTime<number, number>()
        .domain([this.minMoment.valueOf(), this.maxMomentPlusOne.valueOf()])
        .range([0, this.innerWidth]);
    },
    populatedPeriods: function (): DisplayablePeriod[] {
      const scale = this.xScale;

      return this.periods.map(period => ({
        ...period,
        x: Math.round(scale(period.moment.valueOf())),
        class: this.getPeriodClass(period.sunAltitude),
        localizedName: this.t(this.getPeriodNameId(period.sunAltitude))
      }));
    },
    periodWidth: function (): number {
      return Math.round(this.innerWidth / this.rectDivider);
    },
    dataTemporalResolution: function (): number {
      return moment
        .duration(this.periods[1].moment.diff(this.periods[0].moment))
        .asSeconds();
    },
    rectDivider: function (): number {
      const duration = moment.duration(this.maxMoment.diff(this.minMoment));
      return duration.asSeconds() / this.dataTemporalResolution + 1;
    },
    minMoment: function (): moment.Moment {
      // Now returns a moment obj.
      return this.periods[0].moment;
    },
    maxMoment: function (): moment.Moment {
      return this.periods[this.periods.length - 1].moment;
    },
    maxMomentPlusOne: function (): moment.Moment {
      return this.maxMoment.clone().add(this.dataTemporalResolution, "seconds");
    }
  },
  mounted() {
    this.uuid = helpers.uuidv4();
  },
  methods: {
    periodPopover(period: DisplayablePeriod): { title: string, body: string } | { active: false } {
      if (!this.styleConfig.showTooltip) return { active: false };
      return {
        title: this.formatMoment(period.moment),
        body: `${this.capitalize(period.localizedName)} (${this.t('solar elevation angle')} : ${this.round2decimals(period.sunAltitude)}°)`
      };
    },
    capitalize: function (value: string): string {
      if (!value) return ""
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    },
    round2decimals: function (num: number): string {
      return (Math.round(num * 100) / 100).toFixed(2);
    },
    t(stringId: string) {
      return helpers.translateString(stringId, this.selectedLanguageCode, this.texts);
    },
    formatMoment(m: moment.Moment): string {
      return helpers.formatMoment(
        m,
        this.showTimeAs,
        this.styleConfig.tooltipTimeFormat
      );
    },
    getPeriodClass(sunAltitude: number): string {
      return helpers.makeSafeForCSS(this.getPeriodNameId(sunAltitude));
    },
    getPeriodNameId(sunAltitude: number): string {
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
