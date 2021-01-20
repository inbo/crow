<template>
  <b-container class="mt-3">
    <div class="float-right">
      <language-selector />
    </div>
    <h1>{{ t("Birds detected by weather radars") }} </h1>
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
import LanguageSelector from "@/components/LanguageSelector.vue";

export default Vue.extend({
  name: "Introduction",
  components: {
    LanguageSelector
  },
  computed: {
    selectedLanguageCode(): LangCode {
      return UserChoicesStoreModule.selectedLanguageCode;
    },
  },
  methods: {
    t(stringId: string): string | null { // TODO: Remove null here after it's also removed from the "MultilanguageString" type (temporary hack to trigger errors on missing translation)
      // Returns a string of text in the current language
      const texts: MultilanguageStringContainer = {
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
          fr: "Les radars météo sont capables de détecter non seulement la pluie, mais aussi les mouvements des oiseaux. En extrayant de ces données, les scientifiques peuvent etudier leurs migrations.",
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
      }

    if (texts.hasOwnProperty(stringId) && texts[stringId].hasOwnProperty(this.selectedLanguageCode) && texts[stringId][this.selectedLanguageCode] !== null) {
      return texts[stringId][this.selectedLanguageCode];
    } else {
      return stringId;
    }
      
    },
  }
});
</script>