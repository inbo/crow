<template>
  <b-form-group id="input-radar-group" label="At site:" label-for="input-radar">
    <b-form-select
      id="input-radar"
      :value="selectedRadarCode"
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
import { ConfigStoreModule } from '../store/ConfigStore';
import { UserChoicesStoreModule } from '@/store/UserChoicesStore';

export default Vue.extend({
  name: "SiteSelector",
  data: function () {
    return {
    };
  },
  computed: {
    availableRadars(): GroupedRadarInterface[] {
        return ConfigStoreModule.availableRadars;
    },
    selectedRadarCode(): string {
      return UserChoicesStoreModule.selectedRadarCode;
    },  
    selectedRadarLatitude(): number {
      return UserChoicesStoreModule.selectedRadarAsObject.latitude;
    },
    selectedRadarLongitude(): number {
      return UserChoicesStoreModule.selectedRadarAsObject.longitude;
    },
    selectedRadarLocation(): string {
      return UserChoicesStoreModule.selectedRadarAsObject.text;
    },
  },
  methods: {
      ...mapMutations([
          'setSelectedRadarCode'
      ])
  },
});
</script>