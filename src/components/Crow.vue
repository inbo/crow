<template>
  <b-container class="content">
    <b-form form v-on:change="loadData" class="mb-4">
      <b-row>
        <b-col lg>
          <b-row>
            <b-col sm>
              <b-form-group
                id="input-radar-group"
                label="Radar:"
                label-for="input-radar"
                :description="selectedRadarLocation + ' is located in ' + selectedRadarCountry + '.'"
              >
                <b-form-select
                  id="input-radar"
                  size="sm"
                  v-model="selectedRadarODIMCode"
                  :options="availableRadars"
                  value-field="ODIMCode"
                  text-field="location"
                ></b-form-select>
              </b-form-group>
            </b-col>

            <b-col sm>
              <b-form-group
                id="input-date-group"
                label="Date:"
                label-for="input-date"
                description="Charts will be centered on noon for selected date."
              >
                <b-input-group size="sm">
                  <b-input-group-prepend>
                    <b-button
                      variant="outline-secondary"
                      v-on:click="decrementPeriod"
                    >-{{ selectedIntervalLabel }}</b-button>
                  </b-input-group-prepend>

                  <b-form-input
                    id="input-date"
                    type="date"
                    placeholder="Type a date..."
                    v-model="selectedDate"
                  />

                  <b-input-group-append>
                    <b-button
                      variant="outline-secondary"
                      v-on:click="incrementPeriod"
                    >+{{ selectedIntervalLabel }}</b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
            </b-col>
          </b-row>
        </b-col>

        <b-col lg>
          <b-row>
            <b-col cols="6" sm="3">
              <b-form-group id="input-interval-group" label="Interval:" label-for="input-interval">
                <b-form-radio-group
                  id="input-interval"
                  size="sm"
                  buttons
                  button-variant="outline-secondary"
                  v-model="selectedIntervalInHours"
                  :options="availableIntervals"
                ></b-form-radio-group>
              </b-form-group>
            </b-col>

            <b-col cols="6" sm="3">
              <b-form-group id="input-timezone-group" label="Time zone:" label-for="input-timezone">
                <b-form-radio-group
                  id="input-timezone"
                  size="sm"
                  buttons
                  button-variant="outline-secondary"
                  v-model="timeDisplayedAs"
                >
                  <b-form-radio value="radarLocal">Radar</b-form-radio>
                  <b-form-radio value="UTC">UTC</b-form-radio>
                </b-form-radio-group>
              </b-form-group>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </b-form>

    <div v-if="showCharts">
      <b-row>
        <b-col>
          <v-p-chart
            :vtps-data="radarVtpsAsArray"
            :showTimeAs="timeZoneToShow"
            :style-config="VPChartStyle"
          >
            <template v-slot:title>
              <h3>VP Chart</h3>
              <timeline-chart
                :periods="timePeriods"
                :style-config="TimelineChartStyle"
                :showTimeAs="timeZoneToShow"
              ></timeline-chart>
            </template>
          </v-p-chart>
        </b-col>
      </b-row>

      <b-row>
        <b-col>
          <v-p-i-chart
            :vpi-data="integratedProfiles"
            :style-config="VPIChartStyle"
            :showTimeAs="timeZoneToShow"
            :data-temporal-resolution="dataTemporalResolution"
          >
            <template v-slot:title>
              <h3>VPI Chart</h3>
            </template>
          </v-p-i-chart>
        </b-col>
      </b-row>
    </div>
  </b-container>
</template>

<script lang="ts">
import Vue from "vue";
import VPChart from "./VPChart.vue";
import VPIChart from "./VPIChart.vue";
import TimelineChart from "./TimelineChart.vue";

import moment from "moment-timezone";
import axios from "axios";
import SunCalc from "suncalc";
import * as d3 from "d3";

import config from "../config";
import helpers from "../helpers";

import { VPIEntry } from "../VPIEntryInterface";
import { VTPSDataRow } from "../VTPSDataRowInterface";
import { Period } from "../PeriodInterface";
import { RadarInterface } from "../RadarInterface";
import { VTPSEntry } from "../VTPSEntryInterface";
import { TimeInterval } from "../TimeIntervaInterface";

interface VTPSDataByHeight {
  [key: number]: VTPSDataRow;
}

interface RadarVTPSTreeEntry {
  heightData: VTPSDataByHeight;
  sunAltitude: number;
}

interface RadarVtpsAsTree {
  [key: number]: RadarVTPSTreeEntry;
}

// TODO: Use moment objects everywhere (currently date in vtpsDataRow, and string for v-model link)
// Look at other fancy JS stuff available
// TODO: validation of date min <= max
export default Vue.extend({
  name: "Crow",
  data: function() {
    let twoDaysAgo = moment().subtract(2, "days");

    return {
      selectedDate: twoDaysAgo.format(moment.HTML5_FMT.DATE),

      selectedIntervalInHours: config.initialTimeInterval, // The chart show this amount of hours around selectedDate at noon, local (to the radar) time
      //availableIntervals: <TimeInterval[]>config.availableTimeIntervals,
      availableIntervals: config.availableTimeIntervals as TimeInterval[], 

      selectedRadarODIMCode: config.initialRadarODIMCode,
      availableRadars: config.availableRadars as RadarInterface[],
 
      timeDisplayedAs: "radarLocal", // 'radarLocal' | 'UTC'

      showCharts: false,

      VPChartStyle: config.VPChartStyle,
      VPIChartStyle: config.VPIChartStyle,
      TimelineChartStyle: config.TimelineChartStyle,

      dataTemporalResolution: config.vtpsFormat.temporalResolution as number,
      availableHeights: config.vtpsFormat.availableHeights as number[],

      // Data is kept as an object for performance reasons, the "radarVtpsAsArray" computed property allows reading it as an array.
      // All timestamps are kept in UTC (transformed later, in the viz components)
      radarVtps: {} //as () => <RadarVtpsAsTree>
    };
  },
  methods: {
    /* Initialize radarVtps with empty data 
       - The temporal range is [startMoment, endMoment] (resolution: dataTemporalResolution - in seconds)
       - Heights follow availableHeights
    */
    initializeEmptyData() {
      // Remove existing data
      this.radarVtps = {} as () => RadarVtpsAsTree;

      let currentMoment = this.startMoment.clone();
      while (currentMoment.isBefore(this.endMoment)) {
        let heightObj = {} as VTPSDataByHeight;
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

    decrementPeriod() {
      this.selectedDate = moment(this.selectedDate, "YYYY-MM-DD")
        .subtract(this.selectedIntervalInHours, "hours")
        .format(moment.HTML5_FMT.DATE);
      this.loadData();
    },

    incrementPeriod() {
      this.selectedDate = moment(this.selectedDate, "YYYY-MM-DD")
        .add(this.selectedIntervalInHours, "hours")
        .format(moment.HTML5_FMT.DATE);
      this.loadData();
    },

    loadData() {
      this.showCharts = true;

      this.initializeEmptyData();
      this.populateDataFromCrowServer(
        this.selectedRadarODIMCode,
        this.startMoment,
        this.endMoment
      );
    },

    /* Store a Vtps data row originating in a file into vtpsData */
    storeDataRow(vtpsDataRow: VTPSDataRow) {
      let obj = {
        dd: vtpsDataRow.dd,
        ff: vtpsDataRow.ff,
        dens: vtpsDataRow.dens,
        sd_vvp: vtpsDataRow.sd_vvp,
        noData: false
      };

      if (
        Object.prototype.hasOwnProperty.call(
          this.radarVtps,
          vtpsDataRow.datetime
        )
      ) {
        this.$set(
          this.radarVtps[vtpsDataRow.datetime].heightData,
          vtpsDataRow.height,
          obj
        );
      }
    },

    /* for a given radar: iterate on days, load the data files from server and call storeDataRow() for each row */
    populateDataFromCrowServer(
      radarName: string,
      startMoment: moment.Moment,
      endMoment: moment.Moment
    ) {
      let startDay = moment.utc(startMoment, "YYYY-MM-DD");
      let endDay = moment.utc(endMoment, "YYYY-MM-DD").add(1, "days");

      let currentDay = startDay.clone();

      while (currentDay.isBefore(endDay, "day")) {
        let url = this.buildDataUrl(radarName, currentDay);
        axios.get(url).then(response => {
          let dayData = helpers.readVtps(response.data);

          for (const val of dayData) {
            this.storeDataRow(val);
          }
        });
        currentDay.add(1, "days");
      }
    },

    /* Build the data URL for a given day and radar */
    buildDataUrl(radarName: string, selectedDate: moment.Moment) {
      return `${config.dataBaseUrl}/${radarName}/${selectedDate.format(
        "YYYY"
      )}/${radarName}_vpts_${selectedDate.format("YYYYMMDD")}.txt`;
    }
  },
  computed: {
    selectedIntervalLabel(): string {
      /*if (this.availableIntervals) {
        if (this.selectedIntervalInHours) {
          return this.availableIntervals.find(
            d => d.value == this.selectedIntervalInHours
          ).text;
        }
      }*/

      return "1d"; // TODO: fix me

    },
    timeZoneToShow(): string {
      if (this.timeDisplayedAs == "radarLocal") {
        return this.selectedRadarTimezone;
      } else {
        return "UTC";
      }
    },
    timePeriods(): Period[] {
      // An array of all time periods currently shown (derived from radarVtps) with metadata such as the sun's position.
      let periods = [];

      for (let [timestamp, metadataObj] of Object.entries(this.radarVtps)) {
        periods.push({
          moment: moment.utc(+timestamp),
          sunAltitude: metadataObj.sunAltitude
        });
      }

      return periods;
    },
    selectedDateNoon(): moment.Moment {
      return moment(this.selectedDate, "YYYY-MM-DD")
        .hour(12)
        .minute(0)
        .second(0)
        .tz(this.selectedRadarTimezone);
    },
    startMoment(): moment.Moment {
      return moment(this.selectedDateNoon).subtract(
        this.selectedIntervalInHours / 2,
        "hours"
      );
    },
    endMoment(): moment.Moment {
      return moment(this.selectedDateNoon).add(
        this.selectedIntervalInHours / 2,
        "hours"
      );
    },
    selectedRadarAsObject(): RadarInterface {
      let found = this.availableRadars.find(
        d => d.ODIMCode == this.selectedRadarODIMCode
      );
      return found || this.availableRadars[0];
    },
    selectedRadarLatitude(): number {
      return this.selectedRadarAsObject.latitude;
    },
    selectedRadarLongitude(): number {
      return this.selectedRadarAsObject.longitude;
    },
    selectedRadarLocation(): string {
      return this.selectedRadarAsObject.location;
    },
    selectedRadarCountry(): string {
      return this.selectedRadarAsObject.country;
    },
    selectedRadarTimezone(): string {
      return this.selectedRadarAsObject.timezone;
    },
    radarVtpsAsArray(): VTPSEntry[] {
      let dataArray = [];
      for (let [timestamp, metadataObj] of Object.entries(this.radarVtps)) {
        for (let [height, props] of Object.entries(metadataObj.heightData)) {
          let o = { timestamp: +timestamp, height: +height };
          dataArray.push({ ...o, ...props });
        }
      }
      return dataArray;
    },
    integratedProfiles(): VPIEntry[] {
      // TODO: this was copy-pasted from previous version.
      // TODO: could be refactored to 1) use our radarVtps structure instead of creating the temporary nestedVpts
      // TODO: 2) remove dependency to D3

      let nestedVpts = d3
        .nest<VTPSEntry>()
        .key(d => d.timestamp.toString()) // group data by datetime
        .entries(this.radarVtpsAsArray);

      let vpi = nestedVpts.map(d => {
        return {
          moment: moment.utc(+d.key),
          integratedProfiles: helpers.integrateProfile(d.values)
        };
      });
      return vpi;
    }
  },

  mounted: function() {
    this.$nextTick(function() {
      this.loadData();
    });
  },
  components: {
    VPChart,
    VPIChart,
    TimelineChart
  }
});
</script>
