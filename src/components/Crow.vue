<template>
  <b-container class="content">
    <b-form 
      form 
      @change="loadData" 
    >
      <b-row>
        <b-col lg>
          <b-row>
            <b-col sm>
              <b-form-group 
                id="input-radar-group" 
                label="At site:" 
                label-for="input-radar"
              >
                <b-form-select
                  id="input-radar"
                  v-model="selectedRadarValue"
                  size="sm"
                  :options="availableRadars"
                />
                <b-form-text>
                  {{ selectedRadarLocation }} is located at
                  <a
                    :href="`http://www.openstreetmap.org/?mlat=${selectedRadarLatitude}&mlon=${selectedRadarLongitude}&zoom=12`"
                    target="_blank"
                  >{{ selectedRadarLatitude }}, {{ selectedRadarLongitude }}</a>.
                </b-form-text>
              </b-form-group>
            </b-col>

            <b-col sm>
              <b-form-group
                id="input-date-group"
                label="Date:"
                label-for="input-date"
                description="Charts will be centered on noon for the selected date."
              >
                <b-input-group size="sm">
                  <b-input-group-prepend>
                    <b-button
                      variant="outline-secondary"
                      @click="decrementPeriod"
                    >
                      -{{ selectedIntervalLabel }}
                    </b-button>
                  </b-input-group-prepend>
                  <b-form-input
                    id="input-date"
                    v-model="selectedDate"
                    type="date"
                    placeholder="Type a date..."
                  />
                  <b-input-group-append>
                    <b-button
                      variant="outline-secondary"
                      @click="incrementPeriod"
                    >
                      +{{ selectedIntervalLabel }}
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
            </b-col>
          </b-row>
        </b-col>

        <b-col lg>
          <b-row>
            <b-col cols="3">
              <b-form-group 
                id="input-interval-group"
                label="Interval:"
                label-for="input-interval"
              >
                <b-form-radio-group
                  id="input-interval"
                  v-model="selectedIntervalInHours"
                  size="sm"
                  buttons
                  button-variant="outline-secondary"
                  :options="availableIntervals"
                />
              </b-form-group>
            </b-col>

            <b-col cols="3">
              <b-form-group 
                id="input-timezone-group"
                label="Time zone:"
                label-for="input-timezone"
              >
                <b-form-radio-group
                  id="input-timezone"
                  v-model="timeDisplayedAs"
                  size="sm"
                  buttons
                  button-variant="outline-secondary"
                >
                  <b-form-radio value="radarLocal">
                    Radar
                  </b-form-radio>
                  <b-form-radio value="UTC">
                    UTC
                  </b-form-radio>
                </b-form-radio-group>
              </b-form-group>
            </b-col>

            <b-col cols="6">
              <b-form-group 
                id="copy-url-group"
                label="Share:"
              >
                <router-link
                  v-slot="{ href }"
                  append
                  :to="{ path: '/', query: { radar: selectedRadarValue, date: selectedDate, interval: selectedIntervalInHours, timedisplay: timeDisplayedAs, vpColorScheme: VPChartSelectedScheme, vpiMode: VPIChartMode }}"
                >
                  <b-button 
                    v-clipboard:copy="`${baseUrl}${publicPath}${href}`"
                    v-clipboard:success="onCopyUrl"
                    size="sm"
                    variant="outline-primary"
                  >
                    {{ copyUrlButtonText }}
                  </b-button>
                </router-link>
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
            :show-time-as="timeZoneToShow"
            :style-config="VPChartStyle"
            :scheme="VPChartSelectedScheme"
            @color-scheme-changed="vpColorSchemeChanged"
          >
            <template #title>
              <h3>VP Chart</h3>
            </template>

            <template #in-x-axis-group>
              <timeline-chart
                :periods="timePeriods"
                :style-config="TimelineChartStyle"
                :show-time-as="timeZoneToShow"
              />
            </template>
          </v-p-chart>
        </b-col>
      </b-row>

      <b-row>
        <b-col>
          <v-p-i-chart
            :vpi-data="integratedProfiles"
            :style-config="VPIChartStyle"
            :show-time-as="timeZoneToShow"
            :data-temporal-resolution="dataTemporalResolution"
            :mode="VPIChartMode"
            @mode-changed="vpiModeChanged"
          >
            <template #title>
              <h3>VPI Chart</h3>
            </template>

            <template #in-x-axis-group>
              <timeline-chart
                :periods="timePeriods"
                :style-config="TimelineChartStyle"
                :show-time-as="timeZoneToShow"
              />
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

import config from "../config";
import helpers from "../helpers";

import { ColorSchemeIdentifier, IntegratedPropertyName, RadarInterface, GroupedRadarInterface, VTPSDataRowFromFile, TimeInterval, VTPSDataRow, VPIEntry, Period } from '../CrowTypes';

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

const initialCopyUrlText = "Copy link";

export default Vue.extend({
  name: "Crow",
  components: {
    VPChart,
    VPIChart,
    TimelineChart
  },
  props: {
    radarValueProp: { 
      type: String,
      default: config.initialRadarValue
    },
    dateValueProp: {
      type: String,
      default: moment().subtract(1, "days").format(moment.HTML5_FMT.DATE)
    },
    intervalValueProp: {
      type: Number,
      default: config.initialTimeInterval
    },
    timeDisplayValueProp: {
      type: String,
      default: "radarLocal"
    },
    vpChartSelectedSchemeProp: {
      type: String as () => ColorSchemeIdentifier,
      default: 'viridis'
    },
    vpiChartModeProp: {
      type: String as () => IntegratedPropertyName,
      default: 'mtr'
    }
  },
  data: function() {
    return {
      selectedDate: this.dateValueProp,

      selectedIntervalInHours: this.intervalValueProp, // The chart show this amount of hours around selectedDate at noon
      availableIntervals: config.availableTimeIntervals as TimeInterval[],

      selectedRadarValue: this.radarValueProp,
      availableRadars: config.availableRadars as GroupedRadarInterface[],

      timeDisplayedAs: this.timeDisplayValueProp, // 'radarLocal' | 'UTC'

      showCharts: false,

      VPChartStyle: config.VPChartStyle,
      VPChartSelectedScheme: this.vpChartSelectedSchemeProp as ColorSchemeIdentifier,
      VPIChartStyle: config.VPIChartStyle,
      VPIChartMode: this.vpiChartModeProp as IntegratedPropertyName,
      TimelineChartStyle: config.TimelineChartStyle,

      dataTemporalResolution: config.vtpsFormat.temporalResolution as number,
      availableHeights: config.vtpsFormat.availableHeights as number[],

      // Data is kept as an object for performance reasons, the "radarVtpsAsArray" computed property allows reading it as an array.
      // All timestamps are kept in UTC (transformed later, in the viz components)
      radarVtps: {} as RadarVtpsAsTree,

      publicPath: process.env.BASE_URL,
      baseUrl: '',
      copyUrlButtonText: initialCopyUrlText
    };
  },
  computed: {
    selectedIntervalLabel(): string {
      const found = this.availableIntervals.find(
        d => d.value == this.selectedIntervalInHours
      );

      return found ? found.text : "";
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
      const periods = [];

      for (const [timestamp, metadataObj] of Object.entries(this.radarVtps)) {
        periods.push({
          moment: moment.utc(+timestamp),
          sunAltitude: metadataObj.sunAltitude
        });
      }

      return periods;
    },
    selectedDateNoon(): moment.Moment {
      if (this.timeZoneToShow == "UTC") {
        // Noon UTC, if we are in UTC mode
        return moment
          .utc(this.selectedDate, "YYYY-MM-DD")
          .hour(12)
          .minute(0)
          .second(0);
      } else {
        return moment(this.selectedDate, "YYYY-MM-DD") // Noon at radar, if we are in radarLocal mode
          .hour(12)
          .minute(0)
          .second(0)
          .tz(this.timeZoneToShow);
      }
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
      let found = this.availableRadars[0].options[0];

      this.availableRadars.forEach(radarGroup => {
        const groupFound = radarGroup.options.find(
          d => d.value == this.selectedRadarValue
        );
        if (groupFound) {
          found = groupFound;
        }
      });

      return found;
    },
    selectedRadarLatitude(): number {
      return this.selectedRadarAsObject.latitude;
    },
    selectedRadarLongitude(): number {
      return this.selectedRadarAsObject.longitude;
    },
    selectedRadarLocation(): string {
      return this.selectedRadarAsObject.text;
    },
    selectedRadarTimezone(): string {
      return this.selectedRadarAsObject.timezone;
    },
    radarVtpsAsArray(): VTPSDataRow[] {
      const dataArray = [];
      for (const [timestamp, metadataObj] of Object.entries(this.radarVtps)) {
        for (const [height, props] of Object.entries(metadataObj.heightData)) {
          const o = { timestamp: +timestamp, height: +height };
          dataArray.push({ ...o, ...(props as VTPSDataRow) });
        }
      }
      return dataArray;
    },
    integratedProfiles(): VPIEntry[] {
      const integratedProfiles = [] as VPIEntry[];
      for (const [timestamp, treeEntry] of Object.entries(this.radarVtps)) {
        // VTPS values are stored in a tree per height, we need a flat array for integratedProfile
        const dataToIntegrate = [];
        for (const [height, vtpsValues] of Object.entries(treeEntry.heightData)) {
          const o = { height: +height };
          dataToIntegrate.push({
            ...(vtpsValues as VTPSDataRowFromFile),
            ...o
          });
        }

        integratedProfiles.push({
          moment: moment.utc(+timestamp),
          integratedProfiles: helpers.integrateProfile(dataToIntegrate)
        });
      }
      return integratedProfiles;
    }
  },
  watch: {
    // Any change on something that can be shared via URL will reset the button
    selectedRadarValue: function(): void {
      this.resetCopyUrlButtonText();
    },
    selectedDate: function(): void {
      this.resetCopyUrlButtonText();
    },
    selectedIntervalInHours: function(): void {
      this.resetCopyUrlButtonText();
    },
    timeDisplayedAs: function(): void {
      this.resetCopyUrlButtonText();
    },
    VPChartSelectedScheme: function(): void {
      this.resetCopyUrlButtonText();
    },
    VPIChartMode: function(): void {
      this.resetCopyUrlButtonText();
    }
  },
  mounted: function() {
    this.baseUrl = this.trimLastSlash(window.location.origin);
    this.loadData();
  },
  methods: {
    vpiModeChanged(mode: IntegratedPropertyName): void {
      this.VPIChartMode = mode;
    },
    vpColorSchemeChanged(schemeName: ColorSchemeIdentifier): void {
      this.VPChartSelectedScheme = schemeName;
    },
    trimLastSlash(s: string): string {
      return s.replace(/\/$/, "");
    },
    onCopyUrl(): void {
      this.copyUrlButtonText = 'Link copied';
    },
    /* Initialize radarVtps with empty data 
       - The temporal range is [startMoment, endMoment] (resolution: dataTemporalResolution - in seconds)
       - Heights follow availableHeights
    */
    initializeEmptyData(): void {
      // Remove existing data
      this.radarVtps = {} as RadarVtpsAsTree;

      const currentMoment = this.startMoment.clone();
      while (currentMoment.isBefore(this.endMoment)) {
        const heightObj = {} as VTPSDataByHeight;
        this.availableHeights.forEach(height => {
          heightObj[height] = { noData: true };
        });

        const metadataObj = {
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

    decrementPeriod(): void {
      this.selectedDate = moment(this.selectedDate, "YYYY-MM-DD")
        .subtract(this.selectedIntervalInHours, "hours")
        .format(moment.HTML5_FMT.DATE);
      this.loadData();
    },

    incrementPeriod(): void {
      this.selectedDate = moment(this.selectedDate, "YYYY-MM-DD")
        .add(this.selectedIntervalInHours, "hours")
        .format(moment.HTML5_FMT.DATE);
      this.loadData();
    },

    resetCopyUrlButtonText(): void {
      this.copyUrlButtonText = initialCopyUrlText;
    },

    loadData(): void {
      this.$nextTick(() => {
        this.showCharts = true;

        this.initializeEmptyData();
        this.populateDataFromCrowServer(
          this.selectedRadarValue,
          this.startMoment,
          this.endMoment
        );
      });
    },

    /* Store a Vtps data row originating in a file into vtpsData */
    storeDataRow(vtpsDataRow: VTPSDataRowFromFile): void {
      const objToStore = { ...vtpsDataRow, ...{ noData: false } };

      if (
        Object.prototype.hasOwnProperty.call(
          this.radarVtps,
          vtpsDataRow.datetime
        )
      ) {
        this.$set(
          this.radarVtps[vtpsDataRow.datetime].heightData,
          vtpsDataRow.height,
          objToStore
        );
      }
    },

    /* for a given radar: iterate on days, load the data files from server and call storeDataRow() for each row */
    populateDataFromCrowServer(
      radarName: string,
      startMoment: moment.Moment,
      endMoment: moment.Moment
    ): void {
      const startDay = moment.utc(startMoment, "YYYY-MM-DD");
      const endDay = moment.utc(endMoment, "YYYY-MM-DD").add(1, "days");

      const currentDay = startDay.clone();

      while (currentDay.isBefore(endDay, "day")) {
        const url = this.buildDataUrl(radarName, currentDay);
        axios.get(url).then(response => {
          const dayData = helpers.parseVtps(response.data);

          for (const val of dayData) {
            this.storeDataRow(val);
          }
        });
        currentDay.add(1, "days");
      }
    },

    /* Build the data URL for a given day and radar */
    buildDataUrl(radarName: string, selectedDate: moment.Moment): string {
      return `${config.dataServerUrl}/${radarName}/${selectedDate.format(
        "YYYY"
      )}/${radarName}_vpts_${selectedDate.format("YYYYMMDD")}.txt`;
    }
  }
});
</script>
