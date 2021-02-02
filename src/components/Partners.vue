<template>
  <b-container class="mt-5">
    <b-row>
      <b-col lg>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p v-html="t('Partner description')" />
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p v-html="t('Algorithm description')" />
        <p class="logos">
          <img src="logo/inbo.svg" width="30%">
          <img src="logo/kmi_irm.png" width="15%">
          <img src="logo/rbins.png" width="30%">
          <img src="logo/belspo.png" width="15%">
        </p>
      </b-col>
      <b-col lg>
        <p>{{ t("Radar data provided by:") }}</p>
        <ul>
          <li><a href="https://www.meteo.be/">Royal Meteorological Institute of Belgium (RMI)</a> (Jabbeke & Wideumont)</li>
          <li><a href="https://www.vmm.be/">Flemish Environment Agency (VMM)</a> (Helchteren)</li>
          <li><a href="https://www.skeyes.be/">Skeyes</a> (Zaventem)</li>
          <li><a href="https://www.knmi.nl/">Royal Netherlands Meteorological Institute (KMNI)</a> (Herwijnen & Den Helder)</li>
          <li><a href="https://www.dwd.de/">Deutscher Wetterdienst (DWD)</a> (Essen & Neuheilenbach)</li>
          <li><a href="http://www.meteofrance.fr/">Météo-France</a> (Abbeville & Avesnois)</li>
        </ul>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { LangCode, MultilanguageStringContainer } from "@/CrowTypes";
import { UserChoicesStoreModule } from "@/store/UserChoicesStore";
import Vue from "vue";
import helpers from "@/helpers";

export default Vue.extend({
  name: "Partners",
  data: function () {
    return {
      texts: {
        "Partner description": {
          en: "This application was jointly developed by the <a href=\"https://www.meteo.be/\">Royal Meteorological Institute of Belgium (RMI)</a> and the <a href=\"https://www.inbo.be\">Research Institute for Nature and Forest (INBO)</a> in collaboration with the <a href=\"https://www.naturalsciences.be/\">Royal Belgian Institute for Natural Sciences (RBINS)</a>, with financial support from the <a href=\"https://www.belspo.be/\">Belgian Science Policy Office</a> (<code>BelSPO valorisation project CROW</code>).",
          fr: "Cette application a été développée conjointement par l'<a href=\"https://www.meteo.be/\">Institut Royal Météorologique de Belgique</a> et <a href=\"https://www.inbo.be\">INBO (Instituut voor Natuur- en Bosonderzoek)</a> en collaboration avec l'<a href=\"https://www.naturalsciences.be/\">Institut royal des sciences naturelles de Belgique</a>, avec le soutien financier de la <a href=\"https://www.belspo.be/\">Politique scientifique fédérale</a> (<code>BelSPO valorisation project CROW</code>).",
          nl: "Deze applicatie werd gezamenlijk ontwikkeld door het <a href=\"https://www.meteo.be/\">Koninklijk Meteorologisch Instituut van België (KMI)</a> en het <a href =\"https://www.inbo.be\">Instituut voor Natuur- en Bosonderzoek (INBO)</a> in samenwerking met het <a href=\"https://www.naturalsciences.be/\">Koninklijk Belgisch Instituut voor Natuurwetenschappen</a>, met financiële steun van <a href=\"https://www.belspo.be/\">Federaal Wetenschapsbeleid</a> (<code>BelSPO valorisation project CROW</code>)."
        },
        "Algorithm description": {
          en: "The bird detection is based on the algorithm described in Dokter et al. (<a href=\"https://doi.org/10.1098/rsif.2010.0116\">2011</a>, <a href=\"https://doi.org/10.1111/ecog.04028\">2019</a>). The source data are accessible via the <a href=\"https://opendata.meteo.be/ftp/observations/radar/vbird/\">RMI open data portal</a>.",
          fr: "La détection des oiseaux est basée sur l\'algorithme décrit dans Dokter et al. (<a href=\"https://doi.org/10.1098/rsif.2010.0116\">2011</a>, <a href=\"https://doi.org/10.1111/ecog.04028\">2019</a>). Les données sources sont accessibles via le <a href=\"https://opendata.meteo.be/ftp/observations/radar/vbird/\">portail \"open data\" de l'IRM</a>.",
          nl: "De vogeldetectie is gebaseerd op het algoritme beschreven in Dokter et al. (<a href=\"https://doi.org/10.1098/rsif.2010.0116\">2011</a>, <a href=\"https://doi.org/10.1111/ecog.04028\">2019</a>). De brondata zijn beschikbaar via het <a href=\"https://opendata.meteo.be/ftp/observations/radar/vbird/\">KMI open data portaal</a>."
        },
        "Radar data provided by:": {
          en: "Radar data provided by:",
          fr: "Données radar fournies par : ",
          nl: "Radar data aangeleverd door:"
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

<style>
.logos img {
  padding: 0 0.5em;
}
</style>
