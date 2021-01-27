<template>
  <footer class="bg-dark text-muted">
    <b-container>
      <b-row>
        <b-col lg>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="t('Created by')" />
        </b-col>
        <b-col lg class="text-right">
          <a href="https://github.com/inbo/crow/">{{ t('Source code') }} </a> {{ t('version') }}
          <code><a :href="'https://github.com/inbo/crow/tree/' + commitHash()">{{ commitHash() }}</a></code>
        </b-col>
      </b-row>
    </b-container>
  </footer>
</template>

<script lang="ts">
import { LangCode, MultilanguageStringContainer } from "@/CrowTypes";
import helpers from "@/helpers";
import { UserChoicesStoreModule } from "@/store/UserChoicesStore";
import Vue from "vue";

declare const __COMMIT_HASH__: string;

export default Vue.extend({
  name: "PageFooter",
  data: function () {
    return {
      texts: {
        "Created by": {
          en: 'Created by the <a href="https://oscibio.inbo.be">Open science lab for biodiversity</a>',
          fr: 'Créé par <a href="https://oscibio.inbo.be">Open science lab for biodiversity</a>',
          nl: 'Gemaakt door het <a href="https://oscibio.inbo.be">Open science lab for biodiversity</a>'
        },
        "Source code": {
          en: "Source code",
          fr: "Code source",
          nl: "Broncode"
        },
        "version": {
          en: "version",
          fr: "version",
          nl: "versie"
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
    commitHash: function (): string {
      return __COMMIT_HASH__;
    },
    t(stringId: string) {
      return helpers.translateString(stringId, this.selectedLanguageCode, this.texts);
    },
  }
});
</script>
