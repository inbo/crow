<template>
  <div>
    <svg id="timeline-chart" />
  </div>
</template>

<script>
import * as d3 from "d3";

import moment from 'moment-timezone';
import { timeFormatting} from './../mixins/timeFormatting.js'

export default {
  mixins: [timeFormatting],
  props: {
    periods: Array,  // Each entry: {moment: <moment-tz object>, sunAltitude: <altitude>}
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
          "translate(" + this.margin.left + "," + this.margin.top + ")"
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
        .domain([this.minMoment.valueOf(), this.maxMoment.valueOf()])
        .range([0, this.width]);

      if (this.styleConfig.showXAxis) {
        this.chart
          .append("g")
          .attr("transform", "translate(0," + (this.height - 20) + ")")
          .call(d3.axisBottom(this.xAxis).ticks(7).tickFormat(d => {
            return this.formatTimestamp(d);
          }));
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
          return vm.xAxis(row.moment.valueOf()) + 1; // 1 is the axis thickness so the rect doesn't hide it. TODO: retreive value dynamically.
        })
        .attr("y", 0)
        .attr("width", vm.width / vm.rectDivider)
        .attr("height", 20)
        .style("fill", function(row) {
          let alt = row.sunAltitude;
          let style = vm.styleConfig;

          if (alt >= 0) {
            return style.dayColor;
          } else if (alt < 0 && alt >= -18) {
            return style.twilightColor;
          } else {
            return style.nightColor;
          }
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
                <b>Sun altitude</b>: ${row.sunAltitude.toFixed(2)}°`
              )
              .style("left", d3.event.pageX + "px")
              .style("top", d3.event.pageY - 50 + "px");
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
    minMoment: function() { // Now returns a moment obj.
      return this.periods[0].moment;
    },
    maxMoment: function() {
      return this.periods[this.periods.length - 1].moment;
    }
  }
};
</script>