<template>
  <div>
    <b-list-group horizontal="md">
      <b-list-group-item v-for="lang in availableLanguages" :key="lang.code" :active="lang.code === selectedLanguageCode" @click="selectedLanguageCode = lang.code">
        <small>{{ lang.label }}</small>
      </b-list-group-item>
    </b-list-group>
  </div>
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
        get: function(): LangCode {
            return UserChoicesStoreModule.selectedLanguageCode;
        },
        set: function(code: LangCode) {
            UserChoicesStoreModule.setSelectedLanguageCode(code);
        }
    }
  }
});
</script>
