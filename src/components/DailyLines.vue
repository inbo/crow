<template>
  <g>
    <line
      v-for="day in days"
      :key="day.xPositionAtMidnight"
      fill="none"
      :x1="day.xPositionAtMidnight"
      :x2="day.xPositionAtMidnight"
      pointer-events="none"
      y1="0"
      :y2="height"
      :style="lineStyle"
    />
    <text   
      v-for="day in days"
      :key="'text-' + day.xPositionAtMidnight"
      :x="day.xPositionAtMidnight + 5"
      :y="15"
      :style="textStyle"
    >
      {{ day.dayLabel }}
    </text>
  </g>
</template>

<script lang="ts">
import Vue from "vue";

import { DayData } from '../CrowTypes'

export default Vue.extend({
    name: 'DailyLine',
    props: {
        days: {
            type: Array as () => DayData[],
            default: []
        } ,
        height: {
            type: Number,
            default: 100
        },
        color: {
            type: String,
            default: "rgb(33, 37, 41)"
        }
    },
    computed: {
      lineStyle: function(): Record<string, unknown> {
        return {
          'stroke-width': 1,
          'pointer-events': 'none',
          'stroke': this.color
        }
      },
      textStyle: function(): Record<string, unknown> {
        return {
          'font': '12px sans-serif',
          'fill': this.color
        }
      }
    }
});
</script>