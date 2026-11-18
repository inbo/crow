<template>
  <g>
    <line
      v-for="day in daysWithMidnightInParetnChart"
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
      v-for="day in daysWithMidnightInParetnChart"
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
import { defineComponent } from "vue";

import { DayData } from "@/CrowTypes";

export default defineComponent({
  name: "DailyLine",
  props: {
    days: {
      type: Array as () => DayData[],
      default: () => []
    },
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
    daysWithMidnightInParetnChart: function (): DayData[] {
      return this.days.filter(dayData => { return dayData.xPositionAtMidnight >= 0 })
    },
    lineStyle: function (): Record<string, string | number> {
      return {
        "stroke-width": 1,
        "pointer-events": "none",
        "stroke": this.color
      }
    },
    textStyle: function (): Record<string, string> {
      return {
        "font": "12px sans-serif",
        "fill": this.color
      }
    }
  }
});
</script>
