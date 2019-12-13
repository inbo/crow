<template>
  <div>
    <svg />
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  props: {
    vtpsData: Array
  },
  data() {
    return {
      chart: null,
      deb: null
    };
  },
  watch: {
    vtpsData(val) {
      if (this.chart != null) this.chart.remove();
      this.renderChart(val);
    }
  },
  methods: {
    getMinDatetime() {
      return this.vtpsData.reduce(
        (min, p) => (p.datetime < min ? p.datetime : min),
        this.vtpsData[0].datetime
      );
    },
    getMaxDatetime() {
      return this.vtpsData.reduce(
        (max, p) => (p.datetime > max ? p.datetime : max),
        this.vtpsData[0].datetime
      );
    },
    getMaxDensity() {
      return this.vtpsData.reduce(
        (max, p) => (p.dens > max ? p.dens : max),
        this.vtpsData[0].dens
      );
    },
    getDistinctHeights() {  
      return [...new Set(this.vtpsData.map(row => row.height))];
    },
    renderChart(vtpsData_val) {
      var margin = { top: 30, right: 30, bottom: 30, left: 30 },
        width = 1100 - margin.left - margin.right,
        height = 550 - margin.top - margin.bottom;

      var svg = d3
        .select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      this.chart = svg;

      var x = d3
        .scaleTime()
        .domain([this.getMinDatetime(), this.getMaxDatetime()])
        .range([0, width]);
      svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      var y = d3
        .scaleBand()
        .range([height, 0])
        .domain(this.getDistinctHeights())
        .padding(0.01);
      svg.append("g").call(d3.axisLeft(y));

      this.deb = this.getDistinctHeights();

      // Build color scale
      var myColor = d3
        .scaleLinear()
        .range(["#69b3a2", "red"])
        .domain([0, this.getMaxDensity()]);

      svg
        .selectAll()
        .data(vtpsData_val)
        .enter()
        .append("rect")
        .attr("x", function(row) {
          return x(row.datetime);
        })
        .attr("y", function(row) {
          return y(row.height);
        })
        //.attr("width", width/vtpsData_val.length*this.getDistinctHeights().length)
        .attr("width", width / 288.0)
        .attr("height", y.bandwidth())
        .style("fill", function(row) {
          if(row.noData) {
            return '#fff';
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