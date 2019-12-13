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
      deb: null
    };
  },
  watch: {
    vtpsData(val) {
      if (this.chart != null) this.chart.remove();
      this.renderChart(val);
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
    renderChart(vtpsData_val) {
      let margin = { top: 30, right: 30, bottom: 30, left: 30 },
        width = 1100 - margin.left - margin.right,
        height = 550 - margin.top - margin.bottom;

      let svg = d3
        .select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      this.chart = svg;

      let x = d3
        .scaleTime()
        .domain([this.minDatetime, this.maxDatetime])
        .range([0, width]);
      svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      let y = d3
        .scaleBand()
        .range([height, 0])
        .domain(this.distinctHeights)
      svg.append("g").call(d3.axisLeft(y));

      // Build color scale
      let myColor = d3
        .scaleLinear()
        .range(["#69b3a2", "red"])
        .domain([0, this.maxDensity]);

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
        .attr("width", width / this.rectDivider)
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