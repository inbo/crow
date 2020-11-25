<template>
  <svg id="selectorMapContainer" width="440" height="300"></svg>
</template>

<script lang="ts">
import Vue from "vue";
import * as d3 from "d3";
import axios from "axios";

export default Vue.extend({
  name: "SiteSelectorMap",

  mounted: function () {
    this.$nextTick(() => {
      var svg = d3.select("#selectorMapContainer"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

      console.log("svg", svg);

      // Map and projection
      var projection = d3.geoMercator()
        .center([4.67, 50.63])                // GPS of location to zoom on
        .scale(3300)                       // This is like the zoom
        .translate([width / 2, height / 2])

      const url = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
      axios.get(url).then(response => {


        let data = response.data;
        data.features = data.features.filter(function (d) { return d.properties.name == "Belgium" })

        svg.append("g")
          .selectAll("path")
          .data(data.features)
          .enter()
          .append("path")
          .attr("fill", "grey")
          .attr("d", d3.geoPath()
            .projection(projection)
          )
      });
    })
  }
});
</script>