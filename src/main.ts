import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue'
import './plugins/bootstrap-vue'
import App from './App.vue'
import { CreateElement, VNode } from 'vue/types/umd'

Vue.config.productionTip = false

new Vue({
  render: (h: CreateElement): VNode => h(App),
}).$mount('#app')
