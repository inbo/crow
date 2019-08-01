"use strict";

// D3.js

import { fetchVpts, readVpts } from "./modules/fetchVpts.js";
import { integrateProfile } from "./modules/integrateProfile.js";
import { plotVpts } from "./modules/plotVpts.js";
import { plotVpi } from "./modules/plotVpi.js";

// Read example data files
const dataset1 = fetchVpts("2016-09-01", "2016-09-01", "../public/data/");
console.log(dataset1);
const dataset2 = fetchVpts("2016-09-02", "2016-09-03", "../public/data/");
console.log(dataset2);

// Define and bind (empty) vpts chart
let vptsChart = plotVpts().width(800).height(300);
d3.select("#vpts-chart")
  .call(vptsChart);

// Define and bind (empty) vpi chart
let vpiChart = plotVpi().width(800).height(300);
d3.select("#vpi-chart")
  .call(vpiChart);

// Load first dataset
dataset1.then(function(data) {
  let nestedData = d3.nest()
    .key(d => d.datetime) // group data by datetime
    .entries(data);
  
  // Create mtr profile
  let mtrProfile = nestedData.map(d => {
    return {
      datetime: d.key,
      mtr: integrateProfile(d.values)
    }
  });

  // Create subset of vpts data
  let subset = data.slice(0, 5);

  // Bind to vpts chart
  vptsChart.data(subset);
  
  // Bind to vpi chart
  vpiChart.data(mtrProfile);
});

// Wait 1 second and load second dataset
// TODO: don't repeat parsing functionality
setTimeout(function() {
    dataset2.then(function(data) {
      let nestedData = d3.nest()
        .key(d => d.datetime) // group data by datetime
        .entries(data);
      let mtrProfile = nestedData.map(d => {
        return {
          datetime: d.key,
          mtr: integrateProfile(d.values)
        }
      });
      vpiChart.data(mtrProfile);
    });
  },
  1000
);

// Vue.js

let form = new Vue({
  el: "#form",
  data: {
    date: new Date().toISOString().substring(0, 10), // String
    radar: "Jabbeke",
    interval: "week",
    radars: [
      { name: "Jabbeke", country: "Belgium" },
      { name: "Zaventem", country: "Belgium" },
      { name: "Wideumont", country: "Belgium" },
      { name: "Den Helder", country: "the Netherlands" }
    ]
  },
  computed: {
    formattedDate() {
      return new Date(this.date).toLocaleDateString("en-BE", { day: "numeric", weekday: "long", month: "long" , year: "numeric"});
    },
    radarCountry() {
      return this.radars.find(d => d.name == this.radar).country;
    }
  },
  methods: {
    updateCharts() {
      console.log("update");
    }
  }
});
