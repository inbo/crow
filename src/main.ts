import { createApp } from "vue"
import { createPinia } from "pinia"
import { createRouter, createWebHashHistory, RouteLocationNormalized } from "vue-router"
import { createBootstrap } from "bootstrap-vue-next"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-vue-next/dist/bootstrap-vue-next.css"
import App from "./App.vue"
import Home from "@/components/Home.vue"
import PageNotFound from "@/components/PageNotFound.vue"

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: Home,
      props: (route: RouteLocationNormalized): unknown => ({
        radarValueProp: route.query.radar,
        dateValueProp: route.query.date,
        intervalValueProp: route.query.interval,
        timeDisplayValueProp: route.query.timedisplay,
        vpChartSelectedSchemeProp: route.query.vpColorScheme,
        vpiChartModeProp: route.query.vpiMode,
        langCodeProp: route.query.lang,
      })
    }, // Example URL: http://localhost:8080/#/?radar=bezav
    { path: "/:pathMatch(.*)*", component: PageNotFound }
  ]
})

createApp(App)
  .use(createPinia())
  .use(router)
  .use(createBootstrap())
  .mount("#app")
