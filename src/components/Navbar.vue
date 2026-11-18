<template>
  <b-navbar variant="light" container>
    <b-navbar-brand>{{ t("Title") }}</b-navbar-brand>
    <b-navbar-nav class="ms-auto">
      <language-selector />
    </b-navbar-nav>
  </b-navbar>
</template>

<script lang="ts">

import { LangCode, MultilanguageStringContainer } from "@/CrowTypes";
import LanguageSelector from "@/components/LanguageSelector.vue";
import helpers from "@/helpers";
import { useUserChoicesStore } from "@/store/UserChoicesStore";
import { defineComponent } from "vue";
import { BNavbar, BNavbarBrand, BNavbarNav } from "bootstrap-vue-next";

export default defineComponent({
  name: "Navbar",
  components: {
    BNavbar,
    BNavbarBrand,
    BNavbarNav,
    LanguageSelector,
  },
  data: function () {
    return {
      texts: {
        "Title": {
          en: "Birds detected by weather radars",
          fr: "Détection des oiseaux via les radars météo",
          nl: "Vogels gedetecteerd door weerradars"
        },
      } as MultilanguageStringContainer
    }
  },
  computed: {
    selectedLanguageCode(): LangCode {
      return useUserChoicesStore().selectedLanguageCode;
    },
  },
  methods: {
    t(stringId: string) {
      return helpers.translateString(stringId, this.selectedLanguageCode, this.texts);
    },
  }
});
</script>
