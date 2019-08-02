"use strict";

// --- D3.js ---

import { fetchVpts, readVpts } from "./modules/fetchVpts.js";
import { integrateProfile } from "./modules/integrateProfile.js";
import { plotVpts } from "./modules/plotVpts.js";
import { plotVpi } from "./modules/plotVpi.js";

// Define and bind (empty) charts
let vpiChart = plotVpi().height(300);
d3.select("#vpi-chart")
  .call(vpiChart);

let vptsChart = plotVpts().width(800).height(300);
d3.select("#vpts-chart")
  .call(vptsChart); // TODO: use this one

// Load example dataset
// TODO: remove this test
const exampleDataset = fetchVpts("2016-09-01", "2016-09-03", "data");
console.log(exampleDataset);

// --- Vue.js ---

let form = new Vue({
  el: "#form",
  data: {
    radar: "bewid", // TODO: set to bejab
    date: "2019-03-30", // TODO: set to new Date().toISOString().substring(0, 10), // YYYY-MM-DD
    interval: "day", // TODO: set to week
    radars: [
      { code: "bejab", name: "Jabbeke", country: "Belgium" },
      { code: "bezav", name: "Zaventem", country: "Belgium" },
      { code: "bewid", name: "Wideumont", country: "Belgium" },
      { code: "nldhl", name: "Den Helder", country: "the Netherlands" }
    ]
  },
  computed: {
    formattedDate() {
      return new Date(this.date).toLocaleDateString("en-BE", { day: "numeric", weekday: "long", month: "long" , year: "numeric"});
    },
    radarName() {
      return this.radars.find(d => d.code == this.radar).name;
    },
    radarCountry() {
      return this.radars.find(d => d.code == this.radar).country;
    }
  },
  mounted () {
    this.updateCharts();
  },
  methods: {
    changeInterval(direction) {
      let daysToAdd = this.interval == "week" ? 7 : 1; // 7 or 1 days
      if (direction == "previous") {
        daysToAdd = -1 * daysToAdd;
      }
      let updatedDate = new Date(this.date);
      updatedDate.setDate(updatedDate.getDate() + daysToAdd); // Add days
      updatedDate = updatedDate.toISOString().substring(0, 10); // Convert back to YYYY-MM-DD
      this.date = updatedDate;
      this.updateCharts(); // Call this, as it seems not captured by v-on:change on form
    },
    updateCharts() {
      console.log("radar:" + this.radar + ", date:" + this.date + ", interval:" + this.interval);

      let vpts = fetchVpts(this.date, this.date, "data/bewid", "kmi", this.radar); // TODO: take interval into account
      vpts.then(function(data) { // TODO: create separate function for this to be called
        let nestedVpts = d3.nest()
          .key(d => d.datetime) // group data by datetime
          .entries(data);
        
        // Create vpi
        let vpi = nestedVpts.map(d => {
          return {
            datetime: d.key,
            mtr: integrateProfile(d.values)
          }
        });
        // Bind to vpi chart
        vpiChart.data(vpi);
      });
    }
  }
});
