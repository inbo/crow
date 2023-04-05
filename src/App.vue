<template>
  <div id="app">
    <navbar />
    <router-view />
    <page-footer />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import VueRouter from "vue-router";
import "es6-promise/auto"
import { Route } from "vue-router";
import Home from "@/components/Home.vue";
import PageNotFound from "@/components/PageNotFound.vue";
import Navbar from "@/components/Navbar.vue";
import PageFooter from "@/components/PageFooter.vue";
import VueClipboard from "vue-clipboard2";

Vue.use(VueClipboard);
Vue.use(VueRouter);

import store from "./store/index";

const routes = [
  {
    path: "/",
    component: Home,
    props: (route: Route): unknown => ({
      radarValueProp: route.query.radar,
      dateValueProp: route.query.date,
      intervalValueProp: route.query.interval,
      timeDisplayValueProp: route.query.timedisplay,
      vpChartSelectedSchemeProp: route.query.vpColorScheme,
      vpiChartModeProp: route.query.vpiMode,
      langCodeProp: route.query.lang,
    })
  }, // Example URL: http://localhost:8080/#/?radar=bezav
  { path: "*", component: PageNotFound }
];

const router = new VueRouter({
  mode: "hash",
  routes
});

export default Vue.extend({
  router,
  store,
  name: "App",
  components: {
    Navbar,
    PageFooter
  },
});
</script>

<style>
/* 
Style aims to mimic aloftdata.eu, which is based on peterdesmet/petridish@3.0.
Note that bootstrap-vue is based on Bootstrap v5, while petridish@3.0 is based on Bootstrap v5,
so some style differences are to be expected.
*/

main {
  /* See https://github.com/peterdesmet/petridish/blob/3.0/_sass/_main.scss */
  min-height: calc(100vh - 54px);
  padding-bottom: 1.5rem;
}

.container-xl {
  max-width: 1400px; /* Increase from default 1140px to allow space for chart */
}

.navbar {
  /* See https://github.com/peterdesmet/petridish/blob/3.0/_sass/_navbar.scss */
  background-color: white!important;
  border-bottom: 1px solid #e9ecef;
  }

  .navbar .navbar-brand {
    font-weight: bold;
  }


footer {
  /* See https://github.com/peterdesmet/petridish/blob/3.0/_sass/_footer.scss */
  background-color: #0d1626;
  border-top: 5px solid #678bcb;
  color: #678bcb;
  font-size: 0.9rem;
  padding: 0.75rem 0;
  }

  footer .container {
    margin-top: 1rem;
  }

  footer a,
  footer a:hover,
  footer a:visited {
    color: white;
  }

a {
  color: #295cc9;
}

.bg-dark {
  background-color: #282949!important; /* aloftdata.eu banner colour */
}
</style>
