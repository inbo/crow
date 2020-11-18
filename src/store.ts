
import { Module, Mutation, VuexModule } from 'vuex-module-decorators'
import config from './config';
import { GroupedRadarInterface, RadarInterface } from './CrowTypes';

import Vue from 'vue'
import Vuex from "vuex"

Vue.use(Vuex)

@Module
class ConfigStore extends VuexModule {
  availableRadars: GroupedRadarInterface[] = config.availableRadars
}

@Module
class UserChoicesStore extends VuexModule {
  selectedRadarCode = ''

  @Mutation
  setSelectedRadarCode (code: string) {
    this.selectedRadarCode = code;
  }

  get selectedRadarAsObject(): RadarInterface {
    const rootState = this.context.rootState;
    
    let found = rootState.conf.availableRadars[0].options[0];

      rootState.conf.availableRadars.forEach((radarGroup: GroupedRadarInterface) => {
        const groupFound = radarGroup.options.find(
          (d) => d.value == this.selectedRadarCode
        );
        if (groupFound) {
          found = groupFound;
        }
      });

      return found;
  }
}

export default new Vuex.Store({
  modules: {
    conf: ConfigStore,
    userChoices: UserChoicesStore
  }
})