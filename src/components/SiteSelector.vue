<template>
  <b-form-group id="input-radar-group" label="At site:" label-for="input-radar">
    <b-form-select
      id="input-radar"
      :value="this.$store.state.userChoices.selectedRadarCode"
      size="sm"
      :options="availableRadars"
      @change="setSelectedRadarCode"
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
import { mapMutations } from 'vuex';

import { GroupedRadarInterface, RadarInterface } from "../CrowTypes";

import { getModule } from 'vuex-module-decorators';
import ConfigStore from '../store/ConfigStore';

export default Vue.extend({
  name: "SiteSelector",
  data: function () {
    return {
    };
  },
  computed: {
    availableRadars(): GroupedRadarInterface[] {
        let mod = getModule(ConfigStore, this.$store);
        //console.log(this.$store);
        return mod.availableRadars;
    },  
    selectedRadarLatitude(): number {
      return this.$store.getters.selectedRadarAsObject.latitude;
    },
    selectedRadarLongitude(): number {
      return this.$store.getters.selectedRadarAsObject.longitude;
    },
    selectedRadarLocation(): string {
      return this.$store.getters.selectedRadarAsObject.text;;
    },
  },
  methods: {
      ...mapMutations([
          'setSelectedRadarCode'
      ])
  },
});
</script>