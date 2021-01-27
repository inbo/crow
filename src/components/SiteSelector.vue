<template>
  <b-form-group id="input-radar-group" :label="t('At site:')" label-for="input-radar">
    <b-form-select
      id="input-radar"
      :value="selectedRadarCode"
      size="sm"
      :options="availableRadars"
      @change="setSelectedRadarCode"
    />
    <b-form-text>
      {{ selectedRadarLocation }} {{ t("is located at") }}
      <a
        :href="`http://www.openstreetmap.org/?mlat=${selectedRadarLatitude}&mlon=${selectedRadarLongitude}&zoom=12`"
        target="_blank"
      >{{ selectedRadarLatitude }}, {{ selectedRadarLongitude }}</a>.
    </b-form-text>

    <site-selector-map :sites="availableRadars" :selected-radar-code="selectedRadarCode" @click-circle="setSelectedRadarCode($event)" />
  </b-form-group>
</template>

<script lang="ts">
import Vue from "vue";
import { mapMutations } from "vuex";

import { GroupedRadarInterface, LangCode, MultilanguageStringContainer, RadarInterface } from "@/CrowTypes";

import { getModule } from "vuex-module-decorators";
import { ConfigStoreModule } from "@/store/ConfigStore";
import { UserChoicesStoreModule } from "@/store/UserChoicesStore";

import SiteSelectorMap from "@/components/SiteSelectorMap.vue";
import helpers from "@/helpers";

export default Vue.extend({
  name: "SiteSelector",
  components: {
    SiteSelectorMap
  },
  data: function() {
    return {
      texts: {
        "At site:": {
          en: "At site:",
          fr: "Site :",
          nl: null
        },
        "is located at": {
          en: "is located at:",
          fr: "est situé à :",
          nl: null
        }
      } as MultilanguageStringContainer
    }
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
    selectedLanguageCode(): LangCode {
      return UserChoicesStoreModule.selectedLanguageCode;
    },
  },
  methods: {
    t(stringId: string) {
      return helpers.translateString(stringId, this.selectedLanguageCode, this.texts);
    },
    ...mapMutations([
      "setSelectedRadarCode"
    ])
  },
});
</script>
