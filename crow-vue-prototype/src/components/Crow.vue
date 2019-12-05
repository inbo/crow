<template>
  <div>
    <b-alert :show="dataLoadError" variant="danger">
        Data can't be loaded!
    </b-alert>


    <b-form-row>
      <b-col class="mt-4">
        <b-form inline @submit.prevent="loadData">
          
          <b-form-group>
          <b-form-select v-model="selectedRadar" :options='availableRadars'></b-form-select>
          <small class="form-text text-muted" id="radar-help">
            {{ selectedRadarName }} is located in {{ selectedRadarCountry }}
          </small>
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

import config from "../config"

export default {
  data() {
    return {
      selectedDate: moment().format("YYYY-MM-DD"),
      selectedRadar: config.initialRadarCode,
      availableRadars: config.availableRadars,

      dataLoadError: false,

      radarData: ''
    };
  },
  methods: {
    loadData() {
      let vm = this;
      let url = this.buildDataUrl(this.selectedRadar, this.selectedDate);

      axios.get(url).then(response => {
        vm.dataLoadError = false;
        vm.radarData = response.data;
      }).catch(function () {
        vm.dataLoadError = true;
      })
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
      return this.availableRadars.find(d => d.value == this.selectedRadar).country;
    },
  }
};
</script>
