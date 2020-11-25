<template>
  <svg id="selectorMapContainer" :width="svgWidth" :height="svgHeight">
    <g>
      <path fill="grey" :d="countryPath" />
    </g>
  </svg>
</template>

<script lang="ts">
import Vue from "vue";
import * as d3 from "d3";
import axios from "axios";
import { GeoPermissibleObjects } from 'd3';

export default Vue.extend({
  name: "SiteSelectorMap",
  data: function () {
    return {
      svgWidth: 440,
      svgHeight: 300,

      projectionScale: 3300,
      projectionCenter: {
        lon: 4.67,
        lat: 50.63
      },
      
      Countryfeature: { "type": "Feature", "properties": { "name": "Belgium" }, "geometry": { "type": "Polygon", "coordinates": [[[3.314971, 51.345781], [4.047071, 51.267259], [4.973991, 51.475024], [5.606976, 51.037298], [6.156658, 50.803721], [6.043073, 50.128052], [5.782417, 50.090328], [5.674052, 49.529484], [4.799222, 49.985373], [4.286023, 49.907497], [3.588184, 50.378992], [3.123252, 50.780363], [2.658422, 50.796848], [2.513573, 51.148506], [3.314971, 51.345781]]] }, "id": "BEL" } as GeoPermissibleObjects
    }
  },
  computed: {
    projection: function (): d3.GeoProjection {
      return d3.geoMercator()
        .center([this.projectionCenter.lon, this.projectionCenter.lat])
        .scale(this.projectionScale)
        .translate([this.svgWidth / 2, this.svgHeight / 2])
    },

    pathGenerator: function (): d3.GeoPath {
      return d3.geoPath().projection(this.projection);
    },

    countryPath: function (): string | null{
      return this.pathGenerator(this.Countryfeature)
    }
  },
});
</script>