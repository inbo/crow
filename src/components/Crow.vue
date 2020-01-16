<template>
  <div>
    <b-form-row class="mb-4">
      <b-col class="mt-4">
        <b-form inline @submit.prevent="loadData">
          <b>
            <label for="input-radar">Radar:</label>
          </b>
          <b-form-select
            id="input-radar"
            v-model="selectedRadarODIMCode"
            :options="availableRadars"
            value-field="ODIMCode"
            text-field="location"
            size="sm"
            class="mx-1"
          ></b-form-select>
          <b-form-text
            class="mx-2"
          >{{ selectedRadarLocation }} is located in {{ selectedRadarCountry }}</b-form-text>

          <b>
            <label for="input-selected-date">Centered around:</label>
          </b>
          <b-form-input
            id="input-selected-date"
            type="date"
            placeholder="type a date..."
            v-model="selectedDate"
            class="mx-1"
            size="sm"
          />

          <b-form-text class="mx-1">at noon</b-form-text>

          <b-form-group label="Interval" label-cols="auto" label-class="font-weight-bold">
            <b-form-radio-group v-model="intervalInHours">
              <b-form-radio value="24">24h</b-form-radio>
              <b-form-radio value="96">96h</b-form-radio>
            </b-form-radio-group>
          </b-form-group>

          <b-button size="sm" type="submit" variant="primary">Load and view radar data</b-button>
        </b-form>
      </b-col>
    </b-form-row>

    <div v-if="showCharts">
      <b-row>
        <b-col>
          <v-p-chart
            :vtps-data="radarVtpsAsArray"
            :showTimeAs="timeZoneToShow"
            :data-temporal-resolution="dataTemporalResolution"
            :style-config="VPChartStyle"
          >
            <template v-slot:title>
              <h3>VP Chart</h3>
              <timeline-chart
                :periods="timePeriods"
                :style-config="TimelineChartStyle"
                :data-temporal-resolution="dataTemporalResolution"
              ></timeline-chart>
            </template>
          </v-p-chart>
        </b-col>
      </b-row>

      <b-row>
        <b-col>
          <v-p-i-chart :vpi-data="integratedProfiles" :style-config="VPIChartStyle">
            <template v-slot:title>
              <h3>VPI Chart</h3>
            </template>
          </v-p-i-chart>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import VPChart from "./VPChart.vue";
import VPIChart from "./VPIChart.vue";
import TimelineChart from "./TimelineChart.vue";

import moment from "moment";
import axios from "axios";
import SunCalc from "suncalc";
import * as d3 from "d3";

import config from "../config";
import helpers from "../helpers";

// TODO: Use moment objects everywhere (currently date in vtpsDataRow, and string for v-model link)
// Look at other fancy JS stuff available
// TODO: validation of date min <= max

export default {
  data() {
    let twoDaysAgo = moment().subtract(2, "days");

    return {
      selectedDate: twoDaysAgo.format(moment.HTML5_FMT.DATE),
      intervalInHours: 24, // The chart show this amount of hours before and after selectedDate (at noon)
      selectedRadarODIMCode: config.initialRadarODIMCode,
      availableRadars: config.availableRadars,

      timeDisplayedAs: "local_radar", // 'local_radar' | 'UTC'

      showCharts: false,

      VPChartStyle: config.VPChartStyle,
      VPIChartStyle: config.VPIChartStyle,
      TimelineChartStyle: config.TimelineChartStyle,

      dataTemporalResolution: config.vtpsFormat.temporalResolution,
      availableHeights: config.vtpsFormat.availableHeights,

      // Data is kept as an object for performance reasons, the "radarVtpsAsArray" computed property allows reading it as an array.
      // All timestamps are kept in UTC (transformed later, in the viz components)
      radarVtps: {}
    };
  },
  methods: {
    /* Initialize radarVtps with empty data 
       - The temporal range is [startDate, endDate] (resolution: dataTemporalResolution - in seconds)
       - Heights follow availableHeights
    */
    initializeEmptyData() {
      let startTime = moment(this.startDate, "YYYY-MM-DD")
        .hour(0)
        .minute(0)
        .second(0);
      let endTime = moment(this.endDate, "YYYY-MM-DD")
        .hour(23)
        .minute(59)
        .second(59);

      let currentMoment = startTime.clone();

      while (currentMoment.isBefore(endTime)) {
        let heightObj = {};
        this.availableHeights.forEach(height => {
          heightObj[height] = { noData: true };
        });

        let metadataObj = {
          sunAltitude:
            SunCalc.getPosition(
              currentMoment.toDate(),
              this.selectedRadarLatitude,
              this.selectedRadarLongitude
            ).altitude *
            (180 / Math.PI), // In degrees
          heightData: heightObj
        };

        this.$set(
          this.radarVtps,
          currentMoment.toDate().getTime(),
          metadataObj
        );

        currentMoment.add(this.dataTemporalResolution, "seconds");
      }
    },

    loadData() {
      this.showCharts = true;

      this.initializeEmptyData();
      this.populateDataFromCrowServer(
        this.selectedRadarODIMCode,
        this.startDate,
        this.endDate
      );
    },

    /* Store a Vtps data row originating in a file into vtpsData */
    storeDataRow(vtpsDataRow) {
      let obj = {
        dd: vtpsDataRow.dd,
        ff: vtpsDataRow.ff,
        dens: vtpsDataRow.dens,
        sd_vvp: vtpsDataRow.sd_vvp,
        noData: false
      };

      this.$set(
        this.radarVtps[vtpsDataRow.datetime].heightData,
        vtpsDataRow.height,
        obj
      );
    },

    /* for a given radar: iterate on days, load the data files from server and call storeDataRow() for each row */
    populateDataFromCrowServer(radarName, startDate, endDate) {
      let startDay = moment(startDate, "YYYY-MM-DD");
      let endDay = moment(endDate, "YYYY-MM-DD").add(1, "days");

      let currentDay = startDay.clone();

      while (currentDay.isBefore(endDay, "day")) {
        let url = this.buildDataUrl(radarName, currentDay);

        axios
          .get(url)
          .then(response => {
            let dayData = helpers.readVtps(response.data);

            for (const val of dayData) {
              this.storeDataRow(val);
            }
          })
          .catch(function() {});

        currentDay.add(1, "days");
      }
    },

    /* Build the data URL for a given day and radar */
    buildDataUrl(radarName, selectedDate) {
      return `${config.dataBaseUrl}/${radarName}/${selectedDate.format(
        "YYYY"
      )}/${radarName}_vpts_${selectedDate.format("YYYYMMDD")}.txt`;
    }
  },
  computed: {
    timeZoneToShow() {
      if (this.timeDisplayedAs == "local_radar") {
        return this.selectedRadarTimezone;
      } else {
        return "UTC";
      }
    },
    timePeriods() {
      // An array of all time periods currently shown (derived from radarVtps) with metadata such as the sun's position.
      let periods = [];

      for (let [timestamp, metadataObj] of Object.entries(this.radarVtps)) {
        periods.push({
          timestamp: +timestamp,
          sunAltitude: metadataObj.sunAltitude
        });
      }

      return periods;
    },
    selectedDateNoon() {
      return moment(this.selectedDate, "YYYY-MM-DD")
        .hour(12)
        .minute(0)
        .second(0);
    },
    startDate() {
      return moment(this.selectedDateNoon).subtract(
        this.intervalInHours,
        "hours"
      );
    },
    endDate() {
      return moment(this.selectedDateNoon).add(this.intervalInHours, "hours");
    },
    selectedRadarAsObject() {
      return this.availableRadars.find(
        d => d.ODIMCode == this.selectedRadarODIMCode
      );
    },
    selectedRadarLatitude() {
      return this.selectedRadarAsObject.latitude;
    },
    selectedRadarLongitude() {
      return this.selectedRadarAsObject.longitude;
    },
    selectedRadarLocation() {
      return this.selectedRadarAsObject.location;
    },
    selectedRadarCountry() {
      return this.selectedRadarAsObject.country;
    },
    selectedRadarTimezone() {
      return this.selectedRadarAsObject.timezone;
    },
    radarVtpsAsArray() {
      let dataArray = [];
      for (let [timestamp, metadataObj] of Object.entries(this.radarVtps)) {
        for (let [height, props] of Object.entries(metadataObj.heightData)) {
          let o = { timestamp: +timestamp, height: +height };
          dataArray.push({ ...o, ...props });
        }
      }
      return dataArray;
    },
    integratedProfiles() {
      // TODO: this was copy-pasted from previous version.
      // TODO: could be refactored to 1) use our radarVtps structure instead of creating the temporary nestedVpts
      // TODO: 2) remove dependency to D3

      let nestedVpts = d3
        .nest()
        .key(d => d.timestamp) // group data by datetime
        .entries(this.radarVtpsAsArray);

      let vpi = nestedVpts.map(d => {
        return {
          timestamp: +d.key,
          mtr: helpers.integrateProfile(d.values)
        };
      });
      return vpi;
    }
  },

  components: {
    VPChart,
    VPIChart,
    TimelineChart
  }
};
</script>
