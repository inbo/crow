<template>
  <div id="app">
    <main>
      <b-container class="mt-3">
        <h1>Birds detected by weather radars</h1>
        <p>
          <span class="lead text-muted">x birds were detected by weather radars over Belgium last night.</span>
          Weather radars do not only detect rain, but also birds in the sky. By extracting these bird detections, researchers can study their migration. This is especially useful for studying songbirds, which migrate at night. In the visualizations below you can explore these data for 10 radars, covering the entire Benelux. 
        </p>
        <p class="small">
          Note that the bird numbers are estimates. They are dependent on individual radar settings and are particularly unreliable close to the ground, where bird signals are often mixed with ground echoes.
        </p>
      </b-container>

      <router-view />
    </main>

    <footer>
      <b-container>
        <b-row>
          <b-col lg>
            Created by the
            <a href="https://oscibio.inbo.be">Open science lab for biodiversity</a>
          </b-col>
          <b-col 
            lg 
            class="text-right"
          >
            <a href="https://github.com/inbo/crow/">Source code</a> version
            <code>
              <a :href="'https://github.com/inbo/crow/tree/' + commitHash()">{{ commitHash() }}</a>
            </code>
          </b-col>
        </b-row>
      </b-container>
    </footer>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import VueRouter from "vue-router";
import 'es6-promise/auto'
import { Route } from "vue-router";
import Crow from "./components/Crow.vue";
import PageNotFound from "./components/PageNotFound.vue";
import VueClipboard from "vue-clipboard2";
import config from "./config"
import { ticks } from 'd3';
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

declare const __COMMIT_HASH__: string;

export default Vue.extend({
  router,
  store,
  name: "App",
  methods: {
    commitHash: function (): string {
      return __COMMIT_HASH__;
    }
  }
});
</script>

<style>
main {
  min-height: calc(
    100vh - 54px
  ); /* Viewport height minus medium screen navbar height, to push footer to bottom */
  padding-bottom: 30px; /* Don't stick to footer */
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
