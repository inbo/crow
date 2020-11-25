<template>
  <svg id="selectorMapContainer" :width="svgWidth" :height="svgHeight">
    <g>
      <path fill="grey" :d="countryPath" />
      <circle v-for="radar in radars" :key="radar.value" r="3px" fill="red" :cx="projectRadar(radar)[0]" :cy="projectRadar(radar)[1]">
        <title>{{ radar.text }}</title>
      </circle>
    </g>
  </svg>
</template>

<script lang="ts">
import Vue from "vue";
import * as d3 from "d3";
import axios from "axios";
import { GeoPermissibleObjects } from 'd3';
import { GroupedRadarInterface, RadarInterface } from '@/CrowTypes';

export default Vue.extend({
  name: "SiteSelectorMap",
  props: {
    sites: {
      type: Array as () => GroupedRadarInterface[],
      default: []
    }, 
  },
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
    radars: function(): RadarInterface[] {
      // Flat array of radars based on the "sites" prop
      let r: RadarInterface[] = []
      console.log("passe");
      this.sites.forEach(e => {
          r = r.concat(e.options)
        }
      )

      return r;
    },
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
  methods: {
    projectRadar(radar: RadarInterface): [number, number] | null {
      return this.projection([radar.longitude, radar.latitude])
    }
  },
});
</script>