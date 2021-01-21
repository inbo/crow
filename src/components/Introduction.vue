<template>
  <b-container class="mt-3">
    <p>
      <span class="lead text-muted">x {{ t('birds were detected by weather radars over Belgium last night.') }}</span>
      {{ t("Weather radars do not only detect rain, but also birds in the sky. By extracting these bird detections, researchers can study their migration.") }}
      {{ t("This is especially useful for studying songbirds, which migrate at night.") }}
      {{ t("In the visualizations below you can explore these data for 10 radars, covering the entire Benelux.") }} 
    </p>
    <p class="small">
      {{ t("Note that the bird numbers are estimates. They are dependent on individual radar settings and are particularly unreliable close to the ground, where bird signals are often mixed with ground echoes.") }}
    </p>
  </b-container>
</template>

<script lang="ts">
import { LangCode, MultilanguageStringContainer } from "@/CrowTypes";
import { UserChoicesStoreModule } from "@/store/UserChoicesStore";
import Vue from "vue";
import helpers from "@/helpers";

export default Vue.extend({
  name: "Introduction",
  data: function () {
    return {
      texts: {
        'Birds detected by weather radars': {
          en: 'Birds detected by weather radars',
          fr: 'Détection des oiseaux via les radars météo',
          nl: 'Vogels gedetecteerd door weerradars'
        },
        'Note that the bird numbers are estimates. They are dependent on individual radar settings and are particularly unreliable close to the ground, where bird signals are often mixed with ground echoes.': {
          en: 'Note that the bird numbers are estimates. They are dependent on individual radar settings and are particularly unreliable close to the ground, where bird signals are often mixed with ground echoes.',
          fr: "Veuillez noter que le nombre d'oiseaux est une estimation qui dépend de la configuration du radar et peut être incorrecte, en particulier à basse altitude où les échos des oiseaux et du sol sont difficiles à distinguer.",
          nl: null
        },
        'birds were detected by weather radars over Belgium last night.': {
          en: 'birds were detected by weather radars over Belgium last night.',
          fr: 'oiseaux ont été détectés par les radars météo au dessus de la Belgique la nuit dernière.',
          nl: null
        },
        'Weather radars do not only detect rain, but also birds in the sky. By extracting these bird detections, researchers can study their migration.': {
          en: 'Weather radars do not only detect rain, but also birds in the sky. By extracting these bird detections, researchers can study their migration.',
          fr: "Les radars météo sont capables de détecter non seulement la pluie, mais aussi les mouvements des oiseaux. Grace à ces données, les scientifiques peuvent etudier les migrations aviaires.",
          nl: null
        },
        'This is especially useful for studying songbirds, which migrate at night.': {
          en: 'This is especially useful for studying songbirds, which migrate at night.',
          fr: 'Ceci est particulièrement utile pour les Passeri (oiseaux-chanteurs), qui migrent la nuit.',
          nl: null
        },
        'In the visualizations below you can explore these data for 10 radars, covering the entire Benelux.': {
          en: 'In the visualizations below you can explore these data for 10 radars, covering the entire Benelux.',
          fr: "Vous pouvez explorer ces données (provenant de 10 radars sur l'entièreté du Benelux) grace aux graphiques ci-dessous.",
          nl: null
        }
      } as MultilanguageStringContainer
    }
  },
  computed: {
    selectedLanguageCode(): LangCode {
      return UserChoicesStoreModule.selectedLanguageCode;
    },
  },
  methods: {
    t(stringId: string) {
      return helpers.translateString(stringId, this.selectedLanguageCode, this.texts);
    },
  }
});
</script>