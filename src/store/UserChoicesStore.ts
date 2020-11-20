import { GroupedRadarInterface, RadarInterface } from '@/CrowTypes';
import { getModule, Module, Mutation, VuexModule } from "vuex-module-decorators";
import { ConfigStoreModule } from "./ConfigStore";

import store from './index';

@Module({ dynamic: true, store, name: 'userChoices' })
export class UserChoicesStore extends VuexModule {
  selectedRadarCode = ''
  selectedIntervalInHours = 0;  // The chart show this amount of hours around selectedDate at noon

  @Mutation
  setSelectedRadarCode(code: string) {
    this.selectedRadarCode = code;
  }

  @Mutation
  setSelectedIntervalInHours(interval: number) {
    this.selectedIntervalInHours = interval;
  }

  get selectedIntervalLabel(): string {
    const found = ConfigStoreModule.availableIntervals.find(
      d => d.value == this.selectedIntervalInHours
    );

    return found ? found.text : "";
  }

  get selectedRadarAsObject(): RadarInterface {
    let found = ConfigStoreModule.availableRadars[0].options[0];

    ConfigStoreModule.availableRadars.forEach((radarGroup: GroupedRadarInterface) => {
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