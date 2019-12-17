<template>
  <div>
    <slot name="title"></slot>
    <svg />
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  props: {
    vtpsData: Array,
    dataTemporalResolution: Number,
    styleConfig: Object
  },
  data() {
    return {
      chart: null,

      margin: this.styleConfig.margin,
      width: this.styleConfig.width - this.styleConfig.margin.left - this.styleConfig.margin.right,
      height: this.styleConfig.height - this.styleConfig.margin.top - this.styleConfig.margin.bottom,

      xAxis: null,
      yAxis: null
    };
  },
  watch: {
    vtpsData(val) {
      if (this.chart != null) {
        this.chart.remove();
      }

      this.createEmptyChart();
      this.createAndAddChartAxis();
      this.updateChart(val);
    }
  },
  computed: {
    rectDivider: function() {
      let durationInMs = this.maxDatetime - this.minDatetime;
      return durationInMs / 1000 / 60 / this.dataTemporalResolution;
    },
    minDatetime: function() {
      return this.vtpsData.reduce(
        (min, p) => (p.timestamp < min ? p.timestamp : min),
        this.vtpsData[0].timestamp
      );
    },
    maxDatetime: function() {
      return this.vtpsData.reduce(
        (max, p) => (p.timestamp > max ? p.timestamp : max),
        this.vtpsData[0].timestamp
      );
    },
    maxDensity: function() {
      return this.vtpsData.reduce(
        (max, p) => (p.dens > max ? p.dens : max),
        this.vtpsData[0].dens
      );
    },
    distinctHeights: function() {
      return [...new Set(this.vtpsData.map(row => row.height))];
    }
  },
  methods: {
    createEmptyChart() {
      let svg = d3
        .select("svg")
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
      this.chart
        .append("g")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(this.xAxis).tickSizeOuter(0)); // Remove last tick

      this.yAxis = d3
        .scaleBand()
        .range([this.height, 0])
        .domain(this.distinctHeights);
      this.chart
        .append("g")
        .call(d3.axisLeft(this.yAxis).tickSizeOuter(0)); // Remove last tick

      this.chart.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -this.margin.left+20)
        .attr("x", -this.margin.top-70)
        .text("Height (meters)")
    },

    updateChart(vtpsData_val) {
      
      // Build color scale
      let myColor = d3
        .scaleLinear()
        .range([this.styleConfig.minDensityColor, this.styleConfig.maxDensityColor])
        .domain([0, this.maxDensity]);

      let update = this.chart.selectAll().data(vtpsData_val, function(d) {
        return `${d.timestamp} - ${d.height} - ${d.dens}`;
      });

      let enter = update.enter().append("rect");
      let exit = update.exit();

      exit.remove();
      
      var vm = this;

      update
        .merge(enter)
        .attr("x", function(row) {
          return vm.xAxis(row.timestamp);
        })
        .attr("y", function(row) {
          return vm.yAxis(row.height);
        })
        .attr("width", vm.width / vm.rectDivider)
        .attr("height", vm.yAxis.bandwidth())
        .style("fill", function(row) {
          if (row.noData) {
            return vm.styleConfig.noDataColor;
          } else {
            return myColor(row.dens);
          }
        });
    }
  }
};
</script>