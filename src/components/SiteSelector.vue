<template>
  <b-form-group id="input-radar-group" :label="t('Location:')" label-for="input-radar">
    <b-form-select
      id="input-radar"
      :value="selectedRadarCode"
      value-field="odimCode"
      text-field="displayLabel"
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
import { mapActions } from "pinia";

import { GroupedRadarInterface, LangCode, MultilanguageStringContainer, RadarInterface } from "@/CrowTypes";

import { useConfigStore } from "@/store/ConfigStore";
import { useUserChoicesStore } from "@/store/UserChoicesStore";

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
        "Location:": {
          en: "Location:",
          fr: "Site :",
          nl: "Locatie:"
        },
        "is located at": {
          en: "is located at:",
          fr: "est situé à :",
          nl: "bevindt zich te:"
        }
      } as MultilanguageStringContainer
    }
  },
  computed: {
    availableRadars(): GroupedRadarInterface[] {
      return useConfigStore().availableRadars;
    },
    selectedRadarCode(): string {
      return useUserChoicesStore().selectedRadarCode;
    },
    selectedRadarLatitude(): number {
      return useUserChoicesStore().selectedRadarAsObject.latitude;
    },
    selectedRadarLongitude(): number {
      return useUserChoicesStore().selectedRadarAsObject.longitude;
    },
    selectedRadarLocation(): string {
      return useUserChoicesStore().selectedRadarAsObject.text;
    },
    selectedLanguageCode(): LangCode {
      return useUserChoicesStore().selectedLanguageCode;
    },
  },
  methods: {
    t(stringId: string) {
      return helpers.translateString(stringId, this.selectedLanguageCode, this.texts);
    },
    ...mapActions(useUserChoicesStore, ["setSelectedRadarCode"])
  },
});
</script>
<style scoped>
a,
a:hover {
  color: #007bff;
}
</style>
