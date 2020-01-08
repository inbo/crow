<template>
  <div>
    <svg id="timeline-chart" />
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  props: {
    periods: Array,
    styleConfig: Object,
    dataTemporalResolution: Number
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

      xAxis: null
    };
  },
  watch: {
    periods: {
      immediate: true,
      handler(val) {
        this.$nextTick(function() {
          if (this.chart != null) {
            this.chart.remove();
          }

          this.createEmptyChart();
          this.createAndAddChartAxis();
          this.updateChart(val);
        });
      }
    }
  },
  methods: {
    createEmptyChart() {
      console.log("selected: ", d3.select("svg#timeline-chart"));

      let svg = d3
        .select("svg#timeline-chart")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr(
          "transform",
          "translate(" + this.margin.left + "," + this.margin.top + ")"
        );

      this.chart = svg;
    },

    createAndAddChartAxis() {
      this.xAxis = d3
        .scaleTime()
        .domain([this.minDatetime, this.maxDatetime])
        .range([0, this.width]);
      
      if (this.styleConfig.showXAxis) {
        this.chart
        .append("g")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(this.xAxis).tickSizeOuter(0)); // Remove last tick
      }
    },

    updateChart(periods) {
      let update = this.chart.selectAll().data(periods);
      let enter = update.enter().append("rect");
      let exit = update.exit();
      exit.remove();

      var vm = this;

      update
        .merge(enter)
        .attr("x", function(row) {
          return vm.xAxis(row.timestamp) + 1; // 1 is the axis thickness so the rect doesn't hide it. TODO: retreive value dynamically.
        })
        .attr("y", 0)
        .attr("width", vm.width / vm.rectDivider)
        .attr("height", 20)
        .style("fill", function(row) {
          let alt = row.sunAltitude;
          let style = vm.styleConfig;

          if (alt >= 0) {
            return style.dayColor;
          } else if (alt < 0 && alt >= -18 ) {
            return style.twilightColor;
          } else {
            return style.nightColor;
          }
        });
    }
  },
  computed: {
    rectDivider: function() {
      let durationInMs = this.maxDatetime - this.minDatetime;
      return durationInMs / 1000 / this.dataTemporalResolution;
    },
    minDatetime: function() {
      return this.periods[0].timestamp;
    },
    maxDatetime: function() {
      return this.periods[this.periods.length - 1].timestamp;
    }
  }
};
</script>