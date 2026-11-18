<template>
  <b-nav-item-dropdown :text="selectedLanguageLabel">
    <b-dropdown-item v-for="lang in availableLanguages" :key="lang.code" :active="lang.code === selectedLanguageCode" @click="selectedLanguageCode = lang.code">
      {{ lang.label }}
    </b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<script lang="ts">
import { LangCode, Language } from "@/CrowTypes";
import { useConfigStore } from "@/store/ConfigStore";
import { useUserChoicesStore } from "@/store/UserChoicesStore";
import { defineComponent } from "vue";
import { BDropdownItem, BNavItemDropdown } from "bootstrap-vue-next";

export default defineComponent({
  name: "LanguageSelector",
  components: {
    BDropdownItem,
    BNavItemDropdown,
  },
  computed: {
    availableLanguages(): Language[] {
      return useConfigStore().availableLanguages;
    },
    selectedLanguageCode: {
      get: function (): LangCode {
        return useUserChoicesStore().selectedLanguageCode;
      },
      set: function (code: LangCode) {
        useUserChoicesStore().setSelectedLanguageCode(code);
      }
    },
    selectedLanguageLabel(): string {
      return useUserChoicesStore().selectedLanguageLabel
    } 
  },
});
</script>
