<template>
  <div>
    <slot name="title"></slot>
    <svg id="vpi-chart" />
  </div>
</template>

<script>
import * as d3 from "d3";
import { timeFormatting} from './../mixins/timeFormatting.js'

export default {
  mixins: [timeFormatting],
  props: {
    vpiData: Array, // Each entry: {moment: <moment-tz object>, mtr: <mtr>}
    styleConfig: Object,
    showTimeAs: String, // "UTC" or a TZ database entry (such as "Europe/Brussels")
    dataTemporalResolution: Number,
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
    vpiData() {
      if (this.chart != null) {
        this.chart.remove();
      }

      this.createEmptyChart();
      this.createAndAddChartAxis();
      this.updateChart();
    }
  },
  computed: {    
    minMoment: function() {
      return d3.min(this.vpiData, function(d) {
        return d.moment;
      });
    },
    maxMoment: function() {
      return d3.max(this.vpiData, function(d) {
        return d.moment;
      });
    },
    maxMomentPlusOne: function() {
      // TODO: duplicate code in other charts ! Mixin? Helper?
      return this.maxMoment.clone().add(this.dataTemporalResolution, "seconds");
    },
    maxMTR: function() {
      return d3.max(this.vpiData, function(d) {
        return d.mtr;
      });
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
        .domain([this.minMoment.valueOf(), this.maxMomentPlusOne.valueOf()])
        .range([0, this.width]);

      this.chart
        .append("g")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(this.xAxis).ticks(7).tickFormat(d => {
            return this.formatTimestamp(d);
        }));

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
    updateChart() {
      let vm = this;

      this.chart
        .append("path")
        .datum(vm.vpiData)
        .attr("fill", "none")
        .attr("stroke", vm.styleConfig.MTRLineColor)
        .attr("stroke-width", 1.5)
        .attr(
          "d",
          d3
            .line()
            .x(function(d) {
              return vm.xAxis(d.moment.valueOf());
            })
            .y(function(d) {
              let mtr = isNaN(d.mtr) ? 0 : d.mtr;
              return vm.yAxis(mtr);
            })
        );
    }
  }
};
</script>