<template>
  <main>
    <b-container class="mt-3">
      <p>404: page not found</p>
    </b-container>
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { BContainer } from "bootstrap-vue-next";

export default defineComponent({
  name: "PageNotFound",
  components: {
    BContainer,
  },
});
</script>
