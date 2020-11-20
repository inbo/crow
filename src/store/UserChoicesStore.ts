import { GroupedRadarInterface, RadarInterface } from '@/CrowTypes';
import { getModule, Module, Mutation, VuexModule } from "vuex-module-decorators";
import store from './index';

@Module({dynamic: true, store, name: 'userChoices'})
export class UserChoicesStore extends VuexModule {
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

export const UserChoicesStoreModule = getModule(UserChoicesStore);