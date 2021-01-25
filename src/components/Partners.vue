<template>
  <b-container class="mt-5">
    <b-row>
      <b-col lg>
        <p>
          This application was jointly developed by the <a href="https://www.meteo.be/">Royal Meteorological Institute of Belgium (RMI)</a> and the <a href="https://www.inbo.be">Research Institute for Nature and Forest (INBO)</a> in collaboration with the <a href="https://www.naturalsciences.be/">Royal Belgian Institute for Natural Sciences (RBINS)</a>, with financial support from the <a href="https://www.belspo.be/">Belgian Science Policy Office</a> (<code>BelSPO, valorisation project CROW</code>).
        </p>
        <p>
          The bird detection is based on the algorithm described in Dokter et al. (<a href="https://doi.org/10.1098/rsif.2010.0116">2011</a>, <a href="https://doi.org/10.1111/ecog.04028">2019</a>).
        </p>
      </b-col>
      <b-col lg>
        <p>Radar data provided by:</p>
        <ul>
          <li><a href="https://www.meteo.be/">Royal Meteorological Institute of Belgium (RMI)</a> (Jabbeke, Wideumont)</li>
          <li><a href="https://www.vmm.be/">Flemish Environment Agency (VMM)</a> (Helchteren)</li>
          <li><a href="https://www.skeyes.be/">Skeyes</a> (Zaventem)</li>
          <li><a href="https://www.knmi.nl/">Royal Netherlands Meteorological Institute (KMNI)</a> (Herwijnen, Den Helder)</li>
          <li><a href="https://www.dwd.de/">Deutscher Wetterdienst (DWD)</a> (Essen, Neuheilenbach)</li>
          <li><a href="http://www.meteofrance.fr/">Météo-France</a> (Abbeville, Avesnois)</li>
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
        test: {
          en: null,
          fr: null,
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

