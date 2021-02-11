<template>
  <b-container class="mt-3">
    <p>
      <span class="lead text-muted">{{ t("Lead text") }}</span>
      {{ t("Introduction text") }}
    </p>
    <p class="small">
      {{ t("Note regarding estimates") }}
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
        "Lead text": {
          en: "Weather radars do not only detect precipitation, but also birds in the sky.",
          fr: "Les radars météo sont capables de détecter non seulement la pluie, mais aussi les mouvements des oiseaux.",
          nl: "Weerradars detecteren niet alleen neerslag, maar ook vogels in de lucht."
        },
        "Introduction text": {
          en: "By extracting these bird detections, researchers can study their migration. This is especially useful for studying songbirds, which migrate at night. In the visualizations below you can explore these data for 10 radars, covering the entire Benelux.",
          fr: "Grace à ces données, les scientifiques peuvent etudier les migrations aviaires. Ceci est particulièrement utile pour les Passeri (oiseaux-chanteurs), qui migrent la nuit. Vous pouvez explorer ces données (provenant de 10 radars sur l'entièreté du Benelux) grace aux graphiques ci-dessous.",
          nl: "Aan de hand van deze data kunnen onderzoekers hun migratie bestuderen. Dit is vooral handig voor het bestuderen van zangvogels, die 's nachts migreren. In onderstaande visualisaties kunt u deze data verkennen voor 10 radars, die de hele Benelux bestrijken."
        },
        "Note regarding estimates": {
          en: "Note that the bird numbers are estimates. They are dependent on individual radar settings and are particularly unreliable close to the ground, where bird signals are often mixed with ground echoes.",
          fr: "Veuillez noter que le nombre d'oiseaux est une estimation qui dépend de la configuration du radar et peut être incorrecte, en particulier à basse altitude où les échos des oiseaux et du sol sont difficiles à distinguer.",
          nl: "Merk op dat de vogelaantallen schattingen zijn. Ze zijn afhankelijk van individuele radarinstellingen en vooral aantallen dicht bij de grond kunnen onbetrouwbaar zijn door ruis."
        },
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
