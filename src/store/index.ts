import { ConfigStore } from "./ConfigStore";
import { UserChoicesStore } from "./UserChoicesStore";

import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

interface StoreType {
  conf: ConfigStore,
  userChoices: UserChoicesStore
}

export default new Vuex.Store<StoreType>({})
