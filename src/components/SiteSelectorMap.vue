<template>
  <svg id="selectorMapContainer" :width="svgWidth" :height="svgHeight">
    <g>
      <path fill="lightgrey" :d="countryPath" />
      <circle v-for="radar in radars" :key="radar.value" r="5px" :fill="getCircleFillColor(radar)" :cx="projectRadar(radar)[0]" :cy="projectRadar(radar)[1]" @click="$emit('click-circle', radar.value)">
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
import belgiumGeoJSON from '../belgium.json';

export default Vue.extend({
  name: "SiteSelectorMap",
  props: {
    sites: {
      type: Array as () => GroupedRadarInterface[],
      default: []
    },
    selectedRadarCode: {
      type: String,
      default: ''
    }
  },
  data: function () {
    return {
      svgWidth: 300,
      svgHeight: 200,

      projectionScale: 3300,
      projectionCenter: {
        lon: 4.67,
        lat: 50.63
      },

      Countryfeature: belgiumGeoJSON as GeoPermissibleObjects
    }
  },
  computed: {
    radars: function (): RadarInterface[] {
      // Flat array of radars based on the "sites" prop
      let r: RadarInterface[] = []
      this.sites.forEach(e => {
        r = r.concat(e.options)
      })

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

    countryPath: function (): string | null {
      return this.pathGenerator(this.Countryfeature)
    }
  },
  methods: {
    projectRadar(radar: RadarInterface): [number, number] | null {
      return this.projection([radar.longitude, radar.latitude])
    },
    getCircleFillColor(radar: RadarInterface): string {
      return radar.value === this.selectedRadarCode ? "#007aff" : "grey"
    }
  },
});
</script>