<template>
  <div>
    <slot name="title"></slot>
    <svg id="vp-chart" />
  </div>
</template>

<script>
import * as d3 from "d3";
import helpers from "../helpers";
import { timeFormatting} from './../mixins/timeFormatting.js'

export default {
  mixins: [timeFormatting],
  props: {
    vtpsData: Array,
    dataTemporalResolution: Number,
    styleConfig: Object,
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
      yAxisLeft: null,
      yAxisRight: null
    };
  },
  watch: {
    vtpsData() {
      if (this.chart != null) {
        this.chart.remove();
      }

      this.createEmptyChart();
      this.createAndAddChartAxis();
      this.updateChart();
    }
  },
  computed: {
    rectHeight: function() {
      return this.height / this.distinctHeightsMeters.length;
    },
    rectDivider: function() {
      let durationInMs = this.maxTimestamp - this.minTimestamp;
      return durationInMs / 1000 / this.dataTemporalResolution;
    },
    minTimestamp: function() {
      return d3.min(this.vtpsData, function(d) {
        return d.timestamp;
      });
    },
    maxTimestamp: function() {
      return d3.max(this.vtpsData, function(d) {
        return d.timestamp;
      });
    },
    maxDensity: function() {
      return d3.max(this.vtpsData, function(d) {
        return d.dens;
      });
    },
    distinctHeightsMeters: function() {
      return [...new Set(this.vtpsData.map(row => row.height))];
    },
    minHeightInMeters: function() {
      return this.distinctHeightsMeters[0];
    },
    maxHeightInMeters: function() {
      return this.distinctHeightsMeters[this.distinctHeightsMeters.length - 1];
    },
    heightRangeInMeters: function() {
      return [this.minHeightInMeters, this.maxHeightInMeters];
    },
    heightRangeInFeet: function() {
      return this.heightRangeInMeters.map(h => helpers.metersToFeet(h));
    }
  },
  methods: {
    createEmptyChart() {
      let svg = d3
        .select("svg#vp-chart")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr(
          "transform",
          `translate(${this.margin.left}, ${this.margin.top})`
        );

      this.chart = svg;
    },

    createAndAddChartAxis() {
      this.xAxis = d3
        .scaleTime()
        .domain([this.minTimestamp, this.maxTimestamp + (this.dataTemporalResolution * 1000)])
        .range([0, this.width]);

      this.chart
        .append("g")
        .attr("transform", `translate(0, ${this.height})`)
        .call(d3.axisBottom(this.xAxis).ticks(7).tickFormat(d => {
            return this.formatTimestamp(d);
        }));

      this.yAxisLeft = d3
        .scalePoint()
        .range([this.height, 0])
        .domain(this.distinctHeightsMeters.concat([5000])); // The axis needs one more value so the line extends to the top...
      this.chart
        .append("g")
        .call(
          d3
            .axisLeft(this.yAxisLeft)
            .tickValues(this.distinctHeightsMeters) // ... But we don't want to see the added "5000" height, so we specify the tick values manually
            .tickSizeOuter(0) // And we want to hide the last tick line
          ); // Remove last tick

      this.yAxisRight = d3
        .scaleLinear()
        .range([this.height, 0])
        .domain([0, 15748.03]);
      this.chart
        .append("g")
        .attr("transform", `translate(${this.width}, 0)`)
        .call(d3.axisRight(this.yAxisRight).tickSizeOuter(0)); // Remove last tick

      this.chart
        .append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -this.margin.left + 20)
        .attr("x", -this.margin.top - 70)
        .text("Height (meters)");

      this.chart
        .append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", this.width + 55)
        .attr("x", -this.margin.top - 70)
        .text("Height (feet)");
    },

    updateChart() {
      // Build color scale
      let myColor = d3
        .scaleLinear()
        .range([
          this.styleConfig.minDensityColor,
          this.styleConfig.maxDensityColor
        ])
        .domain([0, this.maxDensity]);

      let update = this.chart
        .selectAll()
        .data(this.vtpsData, function(d) {
          return `${d.timestamp} - ${d.height} - ${d.dens}`;
        });

      let enter = update.enter().append("rect");
      let exit = update.exit();

      exit.remove();

      var vm = this;

      update
        .merge(enter)
        .attr("x", function(row) {
          return vm.xAxis(row.timestamp) + 1; // 1 is the axis thickness so the rect doesn't hide it. TODO: retreive value dynamically.
        })
        .attr("y", function(row) {
          return vm.yAxisLeft(row.height) - vm.rectHeight;
        })
        .attr("width", vm.width / vm.rectDivider)
        .attr("height", vm.rectHeight)
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