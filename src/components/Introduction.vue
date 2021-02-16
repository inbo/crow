<template>
  <b-container class="mt-3">
    <p>
      {{ t("Introduction text") }}
    </p>
    <p>
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
        "Introduction text": {
          en: "Weather radars do not only detect precipitation, but also birds in the sky. By extracting these bird detections, researchers can study their migration. This is especially useful for studying songbirds, which migrate at night. In the visualizations below you can explore these data for 10 radars, covering the entire Benelux.",
          fr: "Les radars météorologiques détectent la pluie mais aussi les oiseaux présents dans l'atmosphère. Grâce à ces données, les scientifiques peuvent étudier les migrations des oiseaux. Ceci est particulièrement utile pour les passereaux qui migrent la nuit. Grâce aux graphiques ci-dessous vous pouvez visualiser les données provenant de dix radars permettant de couvrir le Benelux dans son ensemble.",
          nl: "Weerradars detecteren niet alleen neerslag, maar ook vogels in de lucht. Aan de hand van deze data kunnen onderzoekers hun migratie bestuderen. Dit is vooral handig voor het bestuderen van zangvogels, die 's nachts migreren. In onderstaande visualisaties kunt u deze data verkennen voor 10 radars, die de hele Benelux bestrijken."
        },
        "Note regarding estimates": {
          en: "Note that the bird numbers are estimates. They are dependent on individual radar settings and are particularly unreliable close to the ground, where bird signals are often mixed with ground echoes.",
          fr: "Veuillez noter que le nombre d'oiseaux est une estimation qui dépend de la configuration du radar et qui peut être incorrecte, en particulier à basse altitude où les échos provenant des oiseaux et du sol sont difficiles à distinguer.",
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
