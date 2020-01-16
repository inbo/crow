<template>
  <div>
    <slot name="title"></slot>
    <svg id="vp-chart" />
  </div>
</template>

<script>
import * as d3 from "d3";
import moment from "moment-timezone";

import helpers from "../helpers";

export default {
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
    vtpsDataTimezoneAdjusted: function() {
      // vtpsData contains timestamp in UTC
      // this computed property return an adjusted (if necessary) version, depending on showTimeAs

      // TODO: implement
      if (this.showTimeAs === "UTC") {
        return this.vtpsData;
      } else {
        let adjustedData = [];

        moment

        for (const originalRow of this.vtpsData) {
          const updatedRow = { 
            ...originalRow, 
            // We add the necessary offset
            timestamp: originalRow.timestamp - (moment.tz.zone(this.showTimeAs).utcOffset(originalRow.timestamp) * 60 * 1000)
            };
          
          adjustedData.push(updatedRow);
        }
        
        return adjustedData;
      }
    },
    rectDivider: function() {
      let durationInMs = this.maxTimestamp - this.minTimestamp;
      return durationInMs / 1000 / this.dataTemporalResolution;
    },
    minTimestamp: function() {
      return this.vtpsDataTimezoneAdjusted.reduce(
        (min, p) => (p.timestamp < min ? p.timestamp : min),
        this.vtpsDataTimezoneAdjusted[0].timestamp
      );
    },
    maxTimestamp: function() {
      return this.vtpsDataTimezoneAdjusted.reduce(
        (max, p) => (p.timestamp > max ? p.timestamp : max),
        this.vtpsDataTimezoneAdjusted[0].timestamp
      );
    },
    maxDensity: function() {
      return this.vtpsDataTimezoneAdjusted.reduce(
        (max, p) => (p.dens > max ? p.dens : max),
        this.vtpsDataTimezoneAdjusted[this.firstDataIndex].dens
      );
    },

    /* returns the index of the element in this.vtpsDataTimezoneAdjusted where noData = false */
    firstDataIndex: function() {
      return this.vtpsDataTimezoneAdjusted.findIndex(function(elem) {
        return elem.noData === false;
      });
    },
    distinctHeightsMeters: function() {
      return [...new Set(this.vtpsDataTimezoneAdjusted.map(row => row.height))];
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
        .domain([this.minTimestamp, this.maxTimestamp])
        .range([0, this.width]);
      this.chart
        .append("g")
        .attr("transform", `translate(0, ${this.height})`)
        .call(
          d3
            .axisBottom(this.xAxis)
            .tickSizeOuter(0)
            .tickFormat(d3.timeFormat(this.styleConfig.timeAxisFormat))
        ); // Remove last tick

      this.yAxisLeft = d3
        .scaleBand()
        .range([this.height, 0])
        .domain(this.distinctHeightsMeters);
      this.chart.append("g").call(d3.axisLeft(this.yAxisLeft).tickSizeOuter(0)); // Remove last tick

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
        .data(this.vtpsDataTimezoneAdjusted, function(d) {
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
          return vm.yAxisLeft(row.height);
        })
        .attr("width", vm.width / vm.rectDivider)
        .attr("height", vm.yAxisLeft.bandwidth())
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