<template>
  <div>
    <b-alert :show="dataLoadError" variant="danger">Data can't be loaded!</b-alert>

    <b-form-row>
      <b-col class="mt-4">
        <b-form inline @submit.prevent="loadData">
          <b-form-group>
            <b-form-select v-model="selectedRadar" :options="availableRadars"></b-form-select>
            <small
              class="form-text text-muted"
              id="radar-help"
            >{{ selectedRadarName }} is located in {{ selectedRadarCountry }}</small>
          </b-form-group>From:
          <!-- TODO: Add other fields? -->
          <b-form-input type="date" placeholder="type a date..." v-model="startDate" class="mr-2" />To:
          <b-form-input type="date" placeholder="type a date..." v-model="endDate" class="mr-2" />
          <b-button type="submit">Load radar data</b-button>
        </b-form>
      </b-col>
    </b-form-row>

    <b-row>
      <vtps-chart :vtps-data="radarVtpsAsArray" :data-temporal-resolution="dataTemporalResolution" />
    </b-row>
  </div>
</template>

<script>
import VtpsChart from "./VtpsChart.vue";

import moment from "moment";
import axios from "axios";

import config from "../config";
import helpers from "../helpers";

// TODO: Use moment objects everywhere (currently date in vtpsDataRow, and string for v-model link)
// Look at typescript?
// Look at other fancy JS stuff available
// TODO: validation of date min <= max

export default {
  data() {
    return {
      startDate: moment().format("YYYY-MM-DD"),
      endDate: moment().format("YYYY-MM-DD"),
      selectedRadar: config.initialRadarCode,
      availableRadars: config.availableRadars,

      dataTemporalResolution: config.vtpsFormat.temporalResolution,
      availableHeights: config.vtpsFormat.availableHeights,

      dataLoadError: false,

      radarVtps: {}, // Data is kept as an object for performance reasons, the "radarVtpsAsArray" computed property allows reading it as an array

      evt: null // Store event, for debug purposes
    };
  },
  methods: {
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

        this.$set(this.radarVtps, currentMoment.toDate().getTime(), heightObj);

        currentMoment.add(this.dataTemporalResolution, "seconds");
      }
    },

    loadData() {
      this.initializeEmptyData();
      this.populateDataFromCrowServer(
        this.selectedRadar,
        this.startDate,
        this.endDate
      );
    },
    storeDataRow(vtpsDataRow) {
      let obj = {
        dd: vtpsDataRow.dd,
        ff: vtpsDataRow.ff,
        dens: vtpsDataRow.dens,
        sd_vvp: vtpsDataRow.sd_vvp,
        noData: false
      };

      this.$set(this.radarVtps[vtpsDataRow.datetime], vtpsDataRow.height, obj);
    },

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
    buildDataUrl(radarName, selectedDate) {
      return `${config.dataBaseUrl}/${radarName}/${selectedDate.format(
        "YYYY"
      )}/${radarName}_vpts_${selectedDate.format("YYYYMMDD")}.txt`;
    }
  },

  computed: {
    selectedRadarName() {
      return this.availableRadars.find(d => d.value == this.selectedRadar).text;
    },
    selectedRadarCountry() {
      return this.availableRadars.find(d => d.value == this.selectedRadar)
        .country;
    },
    radarVtpsAsArray() {
      let dataArray = [];
      for (let [timestamp, heightObj] of Object.entries(this.radarVtps)) {
        for (let [height, props] of Object.entries(heightObj)) {
          let o = { timestamp: timestamp, height: height };
          dataArray.push({ ...o, ...props });
        }
      }

      return dataArray;
    }
  },

  components: {
    VtpsChart
  }
};
</script>
