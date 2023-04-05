<template>
  <b-container class="mt-5">
    <b-row>
      <b-col lg>
        <p>Weather radars do not only detect precipitation, but also birds in the sky. By extracting these bird detections, researchers can study their movements. This is especially useful for studying songbird migration, which takes place at night. In the visualizations above you can explore these data for a selection of European radars (i.e. the <a href="https://aloftdata.eu/baltrad/">BALTRAD dataset</a>).</p>
      </b-col>
      <b-col lg>
        <p>Data go back to 2012, but contain numerous gaps for certain periods and radars. Note that the bird numbers are estimates and that the quality of the data varies between radars and time periods. The data is dependent on individual radar settings and is particularly unreliable close to the ground, where bird signals are often mixed with ground echoes. See also our <a href="https://aloftdata.eu/about/">FAQ</a>.</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <p>This webpage makes use of <a href="https://github.com/inbo/crow">CROW</a>, an open source tool to visualize birds detected by weather radars (<a href="https://doi.org/10.5281/zenodo.4629449">Noé et al. 2021</a>).</p>
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
        "KNMI source": {
          en: '<a href="https://www.knmi.nl/">Royal Netherlands Meteorological Institute (KMNI)</a> (Herwijnen & Den Helder)', 
          fr: '<a href="https://www.knmi.nl/">Koninklijk Nederlands Meteorologisch Instituut (KNMI)</a> (Herwijnen & Den Helder)',
          nl: '<a href="https://www.knmi.nl/">Koninklijk Nederlands Meteorologisch Instituut (KNMI)</a> (Herwijnen & Den Helder)'
        },
        "VMM source": {
          en: '<a href="https://www.vmm.be/">Flemish Environment Agency (VMM)</a> (Helchteren)',
          fr: '<a href="https://www.vmm.be/">Vlaamse Milieumaatschappij (VMM)</a> (Helchteren)',
          nl: '<a href="https://www.vmm.be/">Vlaamse Milieumaatschappij (VMM)</a> (Helchteren)'
        },
        "RMI source": {
          en: '<a href="https://www.meteo.be/">Royal Meteorological Institute of Belgium (RMI)</a> (Jabbeke & Wideumont)',
          fr: '<a href="https://www.meteo.be/">Institut Royal Météorologique de Belgique (IRM)</a> (Jabbeke & Wideumont)',
          nl: '<a href="https://www.meteo.be/">Koninklijk Meteorologisch Instituut van België (KMI)</a> (Jabbeke & Wideumont)'
        },
        "Partner description": {
          en: "This application was jointly developed by the <a href=\"https://www.meteo.be/\">Royal Meteorological Institute of Belgium (RMI)</a> and the <a href=\"https://www.inbo.be\">Research Institute for Nature and Forest (INBO)</a> in collaboration with the <a href=\"https://www.naturalsciences.be/\">Royal Belgian Institute for Natural Sciences (RBINS)</a>, with financial support from the <a href=\"https://www.belspo.be/\">Belgian Science Policy Office</a> (<code>BelSPO valorisation project CROW</code>).",
          fr: "Cette application a été développée conjointement par l'<a href=\"https://www.meteo.be/\">Institut Royal Météorologique de Belgique</a> et l'<a href=\"https://www.inbo.be\">Institut de Recherche sur la Nature et les Forêts (INBO)</a> en collaboration avec l'<a href=\"https://www.naturalsciences.be/\">Institut royal des sciences naturelles de Belgique</a>, avec le soutien financier de la <a href=\"https://www.belspo.be/\">Politique scientifique fédérale</a> (<code>BelSPO valorisation project CROW</code>).",
          nl: "Deze applicatie werd gezamenlijk ontwikkeld door het <a href=\"https://www.meteo.be/\">Koninklijk Meteorologisch Instituut van België (KMI)</a> en het <a href =\"https://www.inbo.be\">Instituut voor Natuur- en Bosonderzoek (INBO)</a> in samenwerking met het <a href=\"https://www.naturalsciences.be/\">Koninklijk Belgisch Instituut voor Natuurwetenschappen</a>, met financiële steun van <a href=\"https://www.belspo.be/\">Federaal Wetenschapsbeleid</a> (<code>BelSPO valorisation project CROW</code>)."
        },
        "Algorithm description": {
          en: "The bird detection is based on the algorithm described in Dokter et al. (<a href=\"https://doi.org/10.1098/rsif.2010.0116\">2011</a>, <a href=\"https://doi.org/10.1111/ecog.04028\">2019</a>). The source data are accessible via the <a href=\"https://opendata.meteo.be/geonetwork/srv/eng/catalog.search#/metadata/RMI_DATASET_CROW\">RMI open data portal</a>.",
          fr: "La détection des oiseaux est basée sur l\'algorithme décrit dans Dokter et al. (<a href=\"https://doi.org/10.1098/rsif.2010.0116\">2011</a>, <a href=\"https://doi.org/10.1111/ecog.04028\">2019</a>). Les données sources sont accessibles via le <a href=\"https://opendata.meteo.be/geonetwork/srv/eng/catalog.search#/metadata/RMI_DATASET_CROW\">portail \"open data\" de l'IRM</a>.",
          nl: "De vogeldetectie is gebaseerd op het algoritme beschreven in Dokter et al. (<a href=\"https://doi.org/10.1098/rsif.2010.0116\">2011</a>, <a href=\"https://doi.org/10.1111/ecog.04028\">2019</a>). De brondata zijn beschikbaar via het <a href=\"https://opendata.meteo.be/geonetwork/srv/eng/catalog.search#/metadata/RMI_DATASET_CROW\">KMI open data portaal</a>."
        },
        "The radar data are provided by:": {
          en: "The radar data are provided by:",
          fr: "Les données radar sont fournies par :",
          nl: "De radardata worden geleverd door:"
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
