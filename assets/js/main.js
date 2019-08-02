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
    date: "2019-03-30", // Date is passed around as YYYY-MM-DD string to form and functions
    // TODO: set date: moment().format("YYYY-MM-DD"),
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
      return moment(this.date).format("dddd, D MMMM YYYY");
    },
    radarName() {
      return this.radars.find(d => d.code == this.radar).name;
    },
    radarCountry() {
      return this.radars.find(d => d.code == this.radar).country;
    },
    intervalInDays() {
      return this.interval == "week" ? 7 : 1; // 7 or 1 days
    }
  },
  mounted () {
    this.updateCharts();
  },
  methods: {
    changeInterval(direction) {
      if (direction == "next") {
        this.date = moment(this.date).add(this.intervalInDays, "days").format("YYYY-MM-DD");
      } else {
        this.date = moment(this.date).subtract(this.intervalInDays, "days").format("YYYY-MM-DD");
      }
      this.updateCharts(); // Call this, as it seems not captured by v-on:change on form
    },
    updateCharts() {
      console.log("radar:" + this.radar + ", date:" + this.date + ", days:" + this.intervalInDays);

      let vpts = fetchVpts(this.date, this.intervalInDays, "data/bewid", "kmi", this.radar);

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
