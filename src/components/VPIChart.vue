<template>
  <div>
    <slot name="title"></slot>
    <b-form>
      <b-form-row>
        <b-col cols=3>
          <b-form-group id="vpi-display-mode-group" label="Show:" label-for="vpi-display-mode">
            <b-form-select
              id="vpi-display-mode"
              size="sm"
              v-model="selectedMode"
              :options="availableModes"
              value-field="id"
              text-field="label"
            ></b-form-select>
          </b-form-group>
        </b-col>
      </b-form-row>
    </b-form>

    <svg id="vpi-chart" />
  </div>
</template>

<script>
import * as d3 from "d3";
import { timeFormatting } from "./../mixins/timeFormatting.js";

export default {
  mixins: [timeFormatting],
  props: {
    vpiData: Array, // Each entry: {moment: <moment-tz object>, integratedProfiles: <{mtr: 1.23, rtr: 4.06, ....}>}
    styleConfig: Object,
    showTimeAs: String, // "UTC" or a TZ database entry (such as "Europe/Brussels")
    dataTemporalResolution: Number
  },
  data() {
    return {
      chart: null,

      selectedMode: "mtr",
      availableModes: [
        // label: appears in <select> and as legend of the Y axis
        // propertyName: the name of the property (on vpiData[].integratedProfiles) where data can be found
        // yMaxValComputedName: the name of a computed property to get the max value for the Y Axis
        {
          id: "mtr",
          label: "Migration Traffic Rate",
          propertyName: "mtr",
          yMaxValComputedName: "maxMTRWithMinimum"
        },
        {
          id: "rtr",
          label: "Reflectivity traffic rate",
          propertyName: "rtr",
          yMaxValComputedName: "maxRTR"
        },
        {
          id: "vid",
          label: "Vertically integrated density",
          propertyName: "vid",
          yMaxValComputedName: "maxVID"
        },
        {
          id: "vir",
          label: "Vertically integrated reflectivity",
          propertyName: "vir",
          yMaxValComputedName: "maxVIR"
        }
      ],

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
      this.renderChart();
    },
    selectedMode() {
      this.renderChart();
    }
  },
  computed: {
    yMaxVal: function() {
      return this[this.selectedModeObject.yMaxValComputedName];
    },
    selectedModePropertyName: function() {
      return this.selectedModeObject.propertyName;
    },
    selectedModeLabel: function() {
      return this.selectedModeObject.label;
    },
    selectedModeObject: function() {
      return this.availableModes.find(d => d.id == this.selectedMode);
    },
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
    maxVID: function() {
      return d3.max(this.vpiData, function(d) {
        return d.integratedProfiles.vid;
      });
    },
    maxVIR: function() {
      return d3.max(this.vpiData, function(d) {
        return d.integratedProfiles.vir;
      });
    },
    maxMTR: function() {
      return d3.max(this.vpiData, function(d) {
        return d.integratedProfiles.mtr;
      });
    },
    maxRTR: function() {
      return d3.max(this.vpiData, function(d) {
        return d.integratedProfiles.rtr;
      });
    },
    maxMTRWithMinimum: function() {
      // If the maximum MTR is small, we return 50 so a small peak on a very calm day doesn't seem huge
      if (this.maxMTR < 50) {
        return 50;
      } else {
        return this.maxMTR;
      }
    }
  },
  methods: {
    renderChart() {
      if (this.chart != null) {
        this.chart.remove();
      }

      this.createEmptyChart();
      this.createAndAddChartAxis();
      this.updateChart();
    },
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
        .call(
          d3
            .axisBottom(this.xAxis)
            .ticks(7)
            .tickFormat(d => {
              return this.formatTimestamp(d);
            })
        );

      this.yAxis = d3
        .scaleLinear()
        .range([this.height, 0])
        .domain([0, this.yMaxVal]);

      this.chart.append("g").call(d3.axisLeft(this.yAxis).tickSizeOuter(0)); // Remove last tick

      // TODO: make sure label is well positioned in all cases
      this.chart
        .append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -this.margin.left + 20)
        .attr("x", -this.margin.top - 110)
        .text(this.selectedModeLabel);
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
              let rawValue = d.integratedProfiles[vm.selectedModePropertyName];
              return vm.yAxis(isNaN(rawValue) ? 0 : rawValue);
            })
        );
    }
  }
};
</script>