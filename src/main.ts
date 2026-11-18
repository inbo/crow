import "@babel/polyfill"
import "mutationobserver-shim"
import Vue from "vue"
import { createPinia, PiniaVuePlugin } from "pinia"
import "./plugins/bootstrap-vue"
import App from "./App.vue"
import { CreateElement, VNode } from "vue/types/umd"

Vue.config.productionTip = false
Vue.use(PiniaVuePlugin)

new Vue({
  pinia: createPinia(),
  render: (h: CreateElement): VNode => h(App),
}).$mount("#app")
