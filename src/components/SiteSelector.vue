<template>
  <b-form-group id="input-radar-group" label="At site:" label-for="input-radar">
    <b-form-select
      id="input-radar"
      v-model="selectedRadar"
      size="sm"
      :options="availableRadars"
    />
    <b-form-text>
      {{ selectedRadarLocation }} is located at
      <a
        :href="`http://www.openstreetmap.org/?mlat=${selectedRadarLatitude}&mlon=${selectedRadarLongitude}&zoom=12`"
        target="_blank"
      >{{ selectedRadarLatitude }}, {{ selectedRadarLongitude }}</a>.
    </b-form-text>
  </b-form-group>
</template>

<script lang="ts">
import Vue from "vue";

import { GroupedRadarInterface, RadarInterface } from "../CrowTypes";

export default Vue.extend({
  name: "SiteSelector",

  props: {
    availableRadars: {
      type: Array as () => GroupedRadarInterface[],
      default: () => [],
    },
    value: {
      type: String,
      default: "",
    },
  },

  data: function () {
    return {
      selectedRadar: this.value,
    };
  },

  computed: {
    // TODO: copy-pasted from Crow component, refactor (with VueX?)
    selectedRadarAsObject(): RadarInterface {
      let found = this.availableRadars[0].options[0];

      this.availableRadars.forEach((radarGroup) => {
        const groupFound = radarGroup.options.find(
          (d) => d.value == this.selectedRadar
        );
        if (groupFound) {
          found = groupFound;
        }
      });

      return found;
    },
    // TODO: copy-pasted from Crow component, refactor (with VueX?)
    selectedRadarLatitude(): number {
      return this.selectedRadarAsObject.latitude;
    },
    // TODO: copy-pasted from Crow component, refactor (with VueX?)
    selectedRadarLongitude(): number {
      return this.selectedRadarAsObject.longitude;
    },

    selectedRadarLocation(): string {
      return this.selectedRadarAsObject.text;
    },
  },
  watch: {
      'selectedRadar': function(newVal, oldVal) {
          this.$emit('input', newVal);
      }
  },
});
</script>