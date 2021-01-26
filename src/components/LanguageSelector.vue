<template>
  <b-nav-item-dropdown :text="t('Language')">
    <b-dropdown-item v-for="lang in availableLanguages" :key="lang.code" :active="lang.code === selectedLanguageCode" @click="selectedLanguageCode = lang.code">
      {{ lang.label }}
    </b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<script lang="ts">
import { LangCode, Language, MultilanguageStringContainer } from "@/CrowTypes";
import { ConfigStoreModule } from "@/store/ConfigStore";
import { UserChoicesStoreModule } from "@/store/UserChoicesStore";
import helpers from "@/helpers";
import Vue from "vue";

export default Vue.extend({
  name: "LanguageSelector",
  data: function() {
    return {
      'texts': {
        'Language': {
          en: 'Language',
          fr: 'Langue',
          nl: 'Taal'
        }
      } as MultilanguageStringContainer
    }
  },
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
  },
  methods: {
    t(stringId: string) {
      return helpers.translateString(stringId, this.selectedLanguageCode, this.texts);
    },
  }
});
</script>
