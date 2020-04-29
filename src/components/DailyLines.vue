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
      class="day-separator"
      style="stroke-width:1;pointer-events:none;"
    />
    <text
      v-for="day in days"
      :key="'text-' + day.xPositionAtMidnight"
      :x="day.xPositionAtMidnight + 5"
      :y="15"
      class="day-separator"
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
        }
    }
});
</script>

<style scoped>
.day-separator {
  stroke: rgb(33, 37, 41); /* for line */
  fill: rgb(33, 37, 41); /* For text */
  font: 12px sans-serif;
}
</style>