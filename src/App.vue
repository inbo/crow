<template>
  <div id="app">
    <navbar />
    <router-view />
    <page-footer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Navbar from "@/components/Navbar.vue";
import PageFooter from "@/components/PageFooter.vue";

export default defineComponent({
  name: "App",
  components: {
    Navbar,
    PageFooter
  },
});
</script>

<style>
main {
  min-height: calc(
    100vh - 54px
  ); /* Viewport height minus medium screen navbar height, to push footer to bottom */
  padding-bottom: 30px; /* Don't stick to footer */
}

.b-form-group {
  margin-bottom: 1rem; /* Bootstrap 4's .form-group spacing, which Bootstrap 5 dropped */
}

.container-xl {
  max-width: 1400px; /* Increase from default 1140px to allow space for chart */
}

/* Colours and style */
.navbar {
  background-color: white!important;
  border-bottom: 1px solid #e9ecef;
}

.bg-dark {
  background-color: #2c2c2c!important; /* Slightly darker than #343a4f to improve contrast with text */
  --bs-secondary-color: #6c757d; /* Form hints: Bootstrap 5's default is a dark grey meant for light backgrounds */
}

footer {
  border-top: 5px solid #e9ecef;
  font-size: 0.9rem;
  padding: 15px 0;
  }
  footer a,
  footer a:hover,
  footer a:visited {
    color: white;
  }
</style>
