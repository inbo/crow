<template>
  <svg class="d-none d-lg-block mx-auto" :width="svgWidth" :height="svgHeight">
    <g>
      <path id="country" :d="countryPath" />
      <circle v-for="radar in radars" :id="'circle-radar-' + radar.value" :key="radar.value" :class="getRadarExtraClass(radar)" r="5px" :cx="projectRadar(radar)[0]" :cy="projectRadar(radar)[1]" @click="$emit('click-circle', radar.value)">
        <b-popover :target="'circle-radar-' + radar.value" triggers="hover">
          {{ radar.text }}
        </b-popover>
      </circle>
    </g>
  </svg>
</template>

<script lang="ts">
import Vue from "vue";
import * as d3 from "d3";
import axios from "axios";
import { ExtendedFeature, ExtendedFeatureCollection } from 'd3';
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
      svgWidth: 200,
      svgHeight: 200,

      xPadding: 10,
      yPadding: 10,

      Countryfeature: belgiumGeoJSON as ExtendedFeature
    }
  },
  computed: {
    EverythingAsGeoJSON: function (): ExtendedFeatureCollection {
      // Return every geographic element (each radar + country shape) as GeoJSON
      var geojson = {
        "name": "NewFeatureType",
        "type": "FeatureCollection",
        "features": [] 
      } as ExtendedFeatureCollection;

      this.radars.forEach(r => {
        let feature = {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [r.longitude, r.latitude]
          },
          "properties": null
        } as ExtendedFeature;

        geojson.features.push(feature);
      })

      geojson.features.push(this.Countryfeature);
      return geojson
    },
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
        .fitExtent([[this.xPadding, this.yPadding], [this.svgWidth-this.xPadding, this.svgHeight-this.yPadding]], this.EverythingAsGeoJSON);
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
    getRadarExtraClass(radar: RadarInterface): string {
      return radar.value === this.selectedRadarCode ? "radar-circle-selected" : "radar-circle-unselected"
    }

  },
});
</script>

<style scoped>
.radar-circle-unselected {
  fill: grey;
}

.radar-circle-unselected:hover {
  fill: black;
}

.radar-circle-selected {
  fill: #007aff;
}

#country {
  fill: rgb(201, 232, 252);
}
</style>