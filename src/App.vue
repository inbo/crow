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
import 'es6-promise/auto'
import { Route } from "vue-router";
import Crow from "@/components/Crow.vue";
import PageNotFound from "@/components/PageNotFound.vue";
import Navbar from "@/components/Navbar.vue";
import PageFooter from "@/components/PageFooter.vue";
import VueClipboard from "vue-clipboard2";

Vue.use(VueClipboard);
Vue.use(VueRouter);

import store from './store/index';

const routes = [
  // The main route accept the following parameters that will be passed to Crow:
  // - radar
  {
    path: "/",
    component: Crow,
    props: (route: Route): unknown => ({
      radarValueProp: route.query.radar,
      dateValueProp: route.query.date,
      intervalValueProp: route.query.interval,
      timeDisplayValueProp: route.query.timedisplay,
      vpChartSelectedSchemeProp: route.query.vpColorScheme,
      vpiChartModeProp: route.query.vpiMode
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
main {
  min-height: calc(
    100vh - 54px
  ); /* Viewport height minus medium screen navbar height, to push footer to bottom */
  padding-bottom: 30px; /* Don't stick to footer */
}

.container-xl {
  max-width: 1400px; /* Increase from default 1140px to allow space for chart */
}

footer {
  background-color: #3c3c3c;
  border-top: 5px solid #bcbcbc;
  color: #bcbcbc;
  font-size: 0.9rem;
  padding: 15px 0;
}
footer a,
footer a:hover,
footer a:visited {
  color: white;
}
</style>
