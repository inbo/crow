import config from "@/config";
import { GroupedRadarInterface, LangCode, RadarInterface, TimeDisplayedAsValue } from "@/CrowTypes";
import moment from "moment";
import { getModule, Module, Mutation, VuexModule } from "vuex-module-decorators";
import { ConfigStoreModule } from "./ConfigStore";

import store from "./index";

@Module({ dynamic: true, store, name: "userChoices" })
export class UserChoicesStore extends VuexModule {
  // The "real" variable initialization (based on the URL OR, by default, on the config file) happens in the CROW component
  // We kinda duplicate part of this initialization here for two specific reasons:
  //    - to make TS happy (so it nows about variable types)
  //    - performance reasons: the data files will be loaded only once if the selected* variables actually not changed by the initialization code in CROW
  //
  // (selectedLanguageCode: the real initialization happens here because it's not available in the router)

  selectedDate = ""
  selectedRadarCode = config.initialRadarCode;
  selectedIntervalInHours = config.initialTimeInterval;  // The chart show this amount of hours around selectedDate at noon
  timeDisplayedAs: TimeDisplayedAsValue = "radarLocal"

  selectedLanguageCode = config.initialLanguageCode;

  @Mutation
  setSelectedLanguageCode(code: LangCode) {
    this.selectedLanguageCode = code;
  }

  @Mutation
  setSelectedRadarCode(code: string) {
    this.selectedRadarCode = code;
  }

  @Mutation
  setSelectedIntervalInHours(interval: number) {
    this.selectedIntervalInHours = interval;
  }

  @Mutation
  setTimeDisplayedAs(val: TimeDisplayedAsValue) {
    this.timeDisplayedAs = val;
  }

  @Mutation
  setSelectedDate(val: string) {
    this.selectedDate = val;
  }

  get selectedLanguageLabel(): string {
    const found = ConfigStoreModule.availableLanguages.find(
      d => d.code == this.selectedLanguageCode
    );

    return found ? found.label : config.initialLanguageCode;
  }

  get startMoment(): moment.Moment {
    return moment(this.selectedDateNoon).subtract(
      this.selectedIntervalInHours / 2,
      "hours"
    );
  }

  get endMoment(): moment.Moment {
    return moment(this.selectedDateNoon).add(
      this.selectedIntervalInHours / 2,
      "hours"
    );
  }

  get selectedDateNoon(): moment.Moment {
    if (this.timeZoneToShow == "UTC") {
      // Noon UTC, if we are in UTC mode
      return moment
        .utc(this.selectedDate, "YYYY-MM-DD")
        .hour(12)
        .minute(0)
        .second(0);
    } else {
      return moment(this.selectedDate, "YYYY-MM-DD") // Noon at radar location, if we are in radarLocal mode
        .hour(12)
        .minute(0)
        .second(0)
        .tz(this.timeZoneToShow);
    }
  }

  get timeZoneToShow(): string {
    if (this.timeDisplayedAs == "radarLocal") {
      return this.selectedRadarAsObject.timezone;
    } else {
      return "UTC";
    }
  }

  get selectedIntervalStringId(): string {
    const found = ConfigStoreModule.availableIntervals.find(
      d => d.value == this.selectedIntervalInHours
    );

    return found ? found.stringId : "";
  }

  get selectedRadarAsObject(): RadarInterface {
    let found = ConfigStoreModule.availableRadars[0].options[0];

    ConfigStoreModule.availableRadars.forEach((radarGroup: GroupedRadarInterface) => {
      const groupFound = radarGroup.options.find(
        (d) => d.odimCode == this.selectedRadarCode
      );
      if (groupFound) {
        found = groupFound;
      }
    });

    return found;
  }
}

export const UserChoicesStoreModule = getModule(UserChoicesStore);
