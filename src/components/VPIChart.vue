<template>
  <div>
    <slot name="title"></slot>
    <svg id="vpi-chart" />
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  props: {
    vpiData: Array,
    styleConfig: Object
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
      yAxis: null
    };
  },
  watch: {
    vpiData(val) {
      if (this.chart != null) {
        this.chart.remove();
      }

      this.createEmptyChart();
      this.createAndAddChartAxis();
      this.updateChart(val);
    }
  },
  computed: {
    minDatetime: function() {
      return this.vpiData.reduce(
        (min, p) => (p.timestamp < min ? p.timestamp : min),
        this.vpiData[0].timestamp
      );
    },
    maxDatetime: function() {
      return this.vpiData.reduce(
        (max, p) => (p.timestamp > max ? p.timestamp : max),
        this.vpiData[0].timestamp
      );
    },
    maxMTR: function() {
      return this.vpiData.reduce(
        (max, p) => (p.mtr > max ? p.mtr : max),
        this.vpiData[0].mtr
      );
    }
  },
  methods: {
    createEmptyChart() {
      // TODO: Same code in VPChart: factorize!!
      let svg = d3
        .select("svg#vpi-chart")
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
        .scaleLinear()
        .range([this.height, 0])
        .domain([0, this.maxMTR]);
      this.chart.append("g").call(d3.axisLeft(this.yAxis).tickSizeOuter(0)); // Remove last tick

      this.chart
        .append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -this.margin.left + 20)
        .attr("x", -this.margin.top - 70)
        .text("Migration Traffic Rate");
    }, 

    // TODO: update to follow the dynamic update pattern
    // TODO: validate graph by comparing to BioRad
    // TODO: Why is MTR chart often empty?
    // TODO: make sure we don't accidentaly initialize data to 0
    // TODO: DRY between charts
    updateChart(vpiData_val) {
      let vm = this;

      this.chart
        .append("path")
        .datum(vpiData_val)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr(
          "d",
          d3
            .line()
            .x(function(d) {
              return vm.xAxis(d.timestamp);
            })
            .y(function(d) {
              return vm.yAxis(d.mtr);
            })
        );
    }
  }
};
</script>