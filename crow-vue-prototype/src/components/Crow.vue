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
          </b-form-group>

          <!-- TODO: Add other fields? -->
          <b-form-input
            type="date"
            placeholder="type a date..."
            v-model="selectedDate"
            class="mr-2"
          />
          <b-button type="submit">Submit</b-button>
        </b-form>
      </b-col>
    </b-form-row>
  </div>
</template>

<script>
import moment from "moment";
import axios from "axios";

import config from "../config";

export default {
  data() {
    return {
      selectedDate: moment().format("YYYY-MM-DD"),
      selectedRadar: config.initialRadarCode,
      availableRadars: config.availableRadars,

      dataLoadError: false,

      radarVtps: "",
      evt: null // Store event, for debug purposes
    };
  },
  methods: {
    // TODO: move following method to a "helper" JS module
    // TODO: also move its constants (number of header lines, fiels position, ...) to config.js
    readVtps(responseString) {
      let d = responseString.split("\n");

      d = d.map(function(row) {
        return {
          datetime: Date.parse(
            row.substring(0, 4) +
              "-" +
              row.substring(4, 6) +
              "-" +
              row.substring(6, 8) +
              "T" +
              row.substring(9, 11) +
              ":" +
              row.substring(11, 13)
          ),
          height: parseInt(row.substring(14, 18)),
          dd: parseFloat(row.substring(47, 52)),
          ff: parseFloat(row.substring(41, 46)),
          dens: parseFloat(row.substring(76, 82)),
          sd_vvp: parseFloat(row.substring(53, 59))
        };
      });

      return d.splice(4); // Remove 4 header lines
    },
    loadData() {
      let vm = this;
      let url = this.buildDataUrl(this.selectedRadar, this.selectedDate);

      axios
        .get(url)
        .then(response => {
          vm.dataLoadError = false;
          vm.radarVtps = this.readVtps(response.data);
        })
        .catch(function(evt) {
          vm.evt = evt;
          vm.dataLoadError = true;
        });
    },
    buildDataUrl(radarName, selectedDate) {
      let theDate = moment(selectedDate, config.localizedDateFormat);

      return `${config.dataBaseUrl}/${radarName}/${theDate.format(
        "YYYY"
      )}/${radarName}_vpts_${theDate.format("YYYYMMDD")}.txt`;
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
  }
};
</script>
