<template>
  <div>
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

export default {
  data() {
    return {
      selectedDate: "2019-12-05",
      selectedRadar: "behel",
      availableRadars: [
        { value: "behel", text: "Behel?", country: "Belgium" },
        { value: "bejab", text: "Jabbeke", country: "Belgium" },
        { value: "bezav", text: "Zaventem", country: "Belgium" },
        { value: "bewid", text: "Wideumont", country: "Belgium" },
        { value: "nldhl", text: "Den Helder", country: "the Netherlands" }
      ]
    };
  },
  methods: {
    loadData() {
      alert(this.buildDataUrl(this.selectedRadar, this.selectedDate));
    },
    buildDataUrl(radarName, selectedDate) {
      let theDate = moment(selectedDate, "YYYY-MM-DD");

      return `http://crow.weernet.be/${radarName}/${theDate.format(
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
