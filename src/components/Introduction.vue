<template>
  <b-container class="mt-3">
    <div class="float-right">
      <language-selector />
    </div>
    <h1>Birds detected by weather radars</h1>
    <p>
      <span class="lead text-muted">x birds were detected by weather radars over Belgium last night.</span>
      Weather radars do not only detect rain, but also birds in the sky. By extracting these bird detections, researchers can study their migration. This is especially useful for studying songbirds, which migrate at night. In the visualizations below you can explore these data for 10 radars, covering the entire Benelux. 
    </p>
    <p class="small">
      Note that the bird numbers are estimates. They are dependent on individual radar settings and are particularly unreliable close to the ground, where bird signals are often mixed with ground echoes.
    </p>
  </b-container>
</template>

<script lang="ts">
import Vue from "vue";
import LanguageSelector from "./LanguageSelector.vue";

export default Vue.extend({
  name: "Introduction",
  components: {
      LanguageSelector
  }
});
</script>