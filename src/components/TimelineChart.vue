<template>
  <div>
    <svg id="timeline-chart" />
  </div>
</template>

<script>
import * as d3 from "d3";

import moment from "moment-timezone";
import { timeFormatting } from "./../mixins/timeFormatting.js";

export default {
  mixins: [timeFormatting],
  props: {
    periods: Array, // Each entry: {moment: <moment-tz object>, sunAltitude: <altitude>}
    styleConfig: Object,
    dataTemporalResolution: Number,
    showTimeAs: String // "UTC" or a TZ database entry (such as "Europe/Brussels")
  },
  data() {
    return {
      chart: null,

      margin: this.styleConfig.margin,
      width:
        this.styleConfig.width -
        this.styleConfig.margin.left -
        this.styleConfig.margin.right,
      height:
        this.styleConfig.height -
        this.styleConfig.margin.top -
        this.styleConfig.margin.bottom,

      xAxis: null,
      tooltip: null
    };
  },
  watch: {
    periods: {
      immediate: true,
      handler() {
        this.$nextTick(function() {
          if (this.chart != null) {
            this.chart.remove();
          }

          this.createEmptyChart();
          this.createAndAddChartAxis();
          this.updateChart();
        });
      }
    }
  },
  methods: {
    createEmptyChart() {
      this.chart = d3
        .select("svg#timeline-chart")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr(
          "transform",
          `translate(${this.margin.left}, ${this.margin.top})`
        );

      if (this.styleConfig.showTooltip) {
        this.tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);
      }
    },

    createAndAddChartAxis() {
      this.xAxis = d3
        .scaleTime()
        .domain([this.minMoment.valueOf(), this.maxMomentPlusOne.valueOf()])
        .range([0, this.width]);

      if (this.styleConfig.showXAxis) {
        this.chart
          .append("g")
          .attr("transform", `translate(0, ${this.height - 20})`)
          .call(
            d3
              .axisBottom(this.xAxis)
              .ticks(7)
              .tickFormat(d => {
                return this.formatTimestamp(d);
              })
          );
      }
    },

    getPeriodFillColor(sunAltitude) {
      return this.getPeriodData(sunAltitude).color;
    },

    getPeriodName(sunAltitude) {
      return this.getPeriodData(sunAltitude).name;
    },

    getPeriodData(sunAltitude) {
      let style = this.styleConfig;
      
      let color;
      let name;

      if (sunAltitude >= 0) {
        color = style.dayColor;
        name = 'day'
      } else if (sunAltitude < 0 && sunAltitude >= -18) {
        color = style.twilightColor;
        name = 'twilight'
      } else {
        color = style.nightColor;
        name = 'night'
      }

      return {
        'color': color,
        'name': name
      }
    },

    updateChart() {
      let update = this.chart.selectAll().data(this.periods);
      let enter = update.enter().append("rect");
      let exit = update.exit();
      exit.remove();

      var vm = this;

      let sel = update
        .merge(enter)
        .attr("x", function(row) {
          return Math.round(vm.xAxis(row.moment.valueOf()));
        })
        .attr("y", 0)
        .attr("width", Math.round(vm.width / vm.rectDivider))
        .attr("height", 20)
        .style("fill", row => {
          return this.getPeriodFillColor(row.sunAltitude);
        });

      if (this.styleConfig.showTooltip) {
        sel
          .on("mouseover", function(row) {
            vm.tooltip
              .transition()
              .duration(200)
              .style("opacity", 0.9);
            vm.tooltip
              .html(
                `<b>Date</b>: ${vm.formatMoment(row.moment)}<br/>
                <b>Period</b>: ${vm.getPeriodName(row.sunAltitude)}<br/>
                <b>Sun altitude</b>: ${row.sunAltitude.toFixed(2)}°`
              )
              .style("left", d3.event.pageX + "px")
              .style("top", d3.event.pageY - 65 + "px");
          })
          .on("mouseout", function() {
            vm.tooltip
              .transition()
              .duration(500)
              .style("opacity", 0);
          });
      }
    }
  },
  computed: {
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