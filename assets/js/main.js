"use strict";

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
