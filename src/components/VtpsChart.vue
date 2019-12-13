<template>
  <div>
    <svg />
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  props: {
    vtpsData: Array,
    dataTemporalResolution: Number
  },
  data() {
    return {
      chart: null,

      margin: { top: 30, right: 30, bottom: 30, left: 30 },
      width: 1100 - 30 - 30, // -margin left -margin right: factorize
      height: 550 - 30 - 30, // -margin top -margin bottom: factorize

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
        (min, p) => (p.datetime < min ? p.datetime : min),
        this.vtpsData[0].datetime
      );
    },
    maxDatetime: function() {
      return this.vtpsData.reduce(
        (max, p) => (p.datetime > max ? p.datetime : max),
        this.vtpsData[0].datetime
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
        .call(d3.axisBottom(this.xAxis));

      this.yAxis = d3
        .scaleBand()
        .range([this.height, 0])
        .domain(this.distinctHeights);
      this.chart.append("g").call(d3.axisLeft(this.yAxis));
    },

    updateChart(vtpsData_val) {
      // Build color scale
      let myColor = d3
        .scaleLinear()
        .range(["#69b3a2", "red"])
        .domain([0, this.maxDensity]);

      let update = this.chart.selectAll().data(vtpsData_val, function(d) {
        return `${d.datetime} - ${d.height} - ${d.dens}`;
      });

      let enter = update.enter().append("rect");
      let exit = update.exit();

      exit.remove();
      var vm = this;
      update
        .merge(enter)
        .attr("x", function(row) {
          return vm.xAxis(row.datetime);
        })
        .attr("y", function(row) {
          return vm.yAxis(row.height);
        })
        .attr("width", this.width / this.rectDivider)
        .attr("height", vm.yAxis.bandwidth())
        .style("fill", function(row) {
          if (row.noData) {
            return "#fff";
          } else {
            return myColor(row.dens);
          }
        });
    }
  }
};
</script>

<style>
</style>