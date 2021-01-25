<template>
  <b-nav-item-dropdown text="Language">
    <b-dropdown-item v-for="lang in availableLanguages" :key="lang.code" :active="lang.code === selectedLanguageCode" @click="selectedLanguageCode = lang.code">{{ lang.label }}</b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<script lang="ts">
import { LangCode, Language } from "@/CrowTypes";
import { ConfigStoreModule } from "@/store/ConfigStore";
import { UserChoicesStoreModule } from "@/store/UserChoicesStore";
import Vue from "vue";

export default Vue.extend({
  name: "LanguageSelector",
  computed: {
    availableLanguages(): Language[] {
      return ConfigStoreModule.availableLanguages;
    },
    selectedLanguageCode: {
      get: function (): LangCode {
        return UserChoicesStoreModule.selectedLanguageCode;
      },
      set: function (code: LangCode) {
        UserChoicesStoreModule.setSelectedLanguageCode(code);
      }
    }
  }
});
</script>
