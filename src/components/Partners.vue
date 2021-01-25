<template>
  <b-container class="mt-5">
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

