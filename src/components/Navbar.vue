<template>
  <b-navbar type="light" variant="light">
    <b-container>
      <b-navbar-brand>
        {{ t("Birds detected by weather radars") }}
      </b-navbar-brand>
      <b-navbar-nav class="ml-auto">
        <language-selector />
      </b-navbar-nav>
    </b-container>
  </b-navbar>
</template>

<script lang="ts">

import { LangCode, MultilanguageStringContainer } from "@/CrowTypes";
import LanguageSelector from "@/components/LanguageSelector.vue";
import helpers from "@/helpers";
import { UserChoicesStoreModule } from "@/store/UserChoicesStore";
import Vue from "vue";

export default Vue.extend({
  name: "Navbar",
  components: {
    LanguageSelector
  },
  data: function () {
    return {
      texts: {
        'Birds detected by weather radars': {
          en: 'Birds detected by weather radars',
          fr: 'Détection des oiseaux via les radars météo',
          nl: 'Vogels gedetecteerd door weerradars'
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
