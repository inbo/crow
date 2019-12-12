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
      <vtps-chart :vtps-data="radarVtps" />
    </b-row>
  </div>
</template>

<script>
import VtpsChart from "./VtpsChart.vue";

import moment from "moment";
import axios from "axios";
import _ from "lodash";

import config from "../config";
import helpers from "../helpers";

// TODO: Use moment objects everywhere (currently date in vtpsData, and string for v-model link)
// TODO: HAve a "no data" color
// Look at typescript?
// Look at other fancy JS stuff available
// Read let, var, const
// TODO: validation of date min <= max

export default {
  data() {
    return {
      startDate: moment().format("YYYY-MM-DD"),
      endDate: moment().format("YYYY-MM-DD"),
      selectedRadar: config.initialRadarCode,
      availableRadars: config.availableRadars,

      dataLoadError: false,

      radarVtps: [],
      evt: null // Store event, for debug purposes
    };
  },
  methods: {
    emptyVtpsData(startDate, endDate) {
      var start = moment(startDate, "YYYY-MM-DD")
        .hour(0)
        .minute(0)
        .second(0);
      var end = moment(endDate, "YYYY-MM-DD")
        .hour(23)
        .minute(59)
        .second(59);

      var currentMoment = start.clone();
      var allHeights = _.range(0, 4800 + 1, 200);
      var vm = this;

      vm.radarVtps = [];

      while (currentMoment.isBefore(end)) {
        allHeights.forEach(function(height) {
          vm.radarVtps.push({
            datetime: currentMoment.toDate().getTime(),
            height: height,
            dd: 0,
            ff: 0,
            dens: 0,
            sd_vvp: 0
          });
        });

        currentMoment.add(5, "minutes");
      }
    },

    loadData() {
      this.emptyVtpsData(this.startDate, this.endDate);
      this.populateDataFromCrowServer(
        this.selectedRadar,
        this.startDate,
        this.endDate
      );
    },
    populateDataFromCrowServer(radarName, startDate, endDate) {
      var startDay = moment(startDate, "YYYY-MM-DD");
      var endDay = moment(endDate, "YYYY-MM-DD").add(1, "days");

      var currentDay = startDay.clone();

      var firstRun = true;

      while (currentDay.isBefore(endDay, "day")) {
        let url = this.buildDataUrl(radarName, currentDay);
        var dayData = [];

        axios
          .get(url)
          .then(response => {
            dayData = helpers.readVtps(response.data);

            // Merge new data into existing
            dayData.forEach(element => {
              // Find row matching time/altitude
              var pos = this.radarVtps.findIndex(function(emptyElem) {
                if (firstRun) {
                  firstRun = false;
                }

                if (
                  emptyElem.datetime === element.datetime &&
                  emptyElem.height === element.height
                ) {
                  return true;
                }
              });

              this.radarVtps.splice(pos, 1, element); // Call splice so reactivity works
            });
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
    }
  },

  components: {
    VtpsChart
  }
};
</script>
