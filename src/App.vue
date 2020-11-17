<template>
  <div id="app">
    <b-navbar 
      type="light" 
      variant="light" 
      toggleable="lg"
    >
      <b-container>
        <b-navbar-brand>CROW</b-navbar-brand>
      </b-container>
    </b-navbar>

    <main>
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
import Vuex from "vuex"
import 'es6-promise/auto'
import { Route } from "vue-router";
import Crow from "./components/Crow.vue";
import PageNotFound from "./components/PageNotFound.vue";
import VueClipboard from "vue-clipboard2";
import { GroupedRadarInterface, RadarInterface } from "./CrowTypes";
import config from "./config"

Vue.use(VueClipboard);
Vue.use(VueRouter);
Vue.use(Vuex);

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

const configStore = {
  state: () => ({
    availableRadars: config.availableRadars as GroupedRadarInterface[]
  }),
  mutations: {
  },
  actions: {},
  getters: {
  }
}

const userChoicesStore = {
  state: () => ({
    selectedRadarCode: ''
  }),
  mutations: {
    setSelectedRadarCode (state: any, code: String) {
      state.selectedRadarCode = code;
    }
  },
  actions: {},
  getters: {
    selectedRadarAsObject(state: any, getters: any, rootState: any): RadarInterface {
      let found = rootState.conf.availableRadars[0].options[0];

      rootState.conf.availableRadars.forEach((radarGroup: GroupedRadarInterface) => {
        const groupFound = radarGroup.options.find(
          (d) => d.value == state.selectedRadarCode
        );
        if (groupFound) {
          found = groupFound;
        }
      });

      return found;
    }
  }
}


const store = new Vuex.Store({
  modules: {
    conf: configStore,
    userChoices: userChoicesStore
  }
})

declare const __COMMIT_HASH__: string;

export default Vue.extend({
  router,
  store,
  name: "App",
  methods: {
    commitHash: function(): string {
      return __COMMIT_HASH__;
    }
  }
});
</script>

<style>
.navbar {
  background-color: white !important;
  border-bottom: 1px solid #e9ecef;
}
.navbar-brand {
  font-weight: bold;
}
.navbar-brand img {
  height: 30px;
}

main {
  min-height: calc(
    100vh - 54px
  ); /* Viewport height minus medium screen navbar height, to push footer to bottom */
  padding-bottom: 30px; /* Don't stick to footer */
}
.content {
  margin-top: 15px;
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
