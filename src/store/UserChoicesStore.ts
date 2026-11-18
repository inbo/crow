import config from "@/config";
import { GroupedRadarInterface, LangCode, RadarInterface, TimeDisplayedAsValue } from "@/CrowTypes";
import moment from "moment-timezone";
import { defineStore } from "pinia";
import { useConfigStore } from "./ConfigStore";

export const useUserChoicesStore = defineStore("userChoices", {
  // The "real" variable initialization (based on the URL OR, by default, on the config file) happens in the CROW component
  // We kinda duplicate part of this initialization here for two specific reasons:
  //    - to make TS happy (so it nows about variable types)
  //    - performance reasons: the data files will be loaded only once if the selected* variables actually not changed by the initialization code in CROW
  //
  // (selectedLanguageCode: the real initialization happens here because it's not available in the router)
  state: () => ({
    selectedDate: "",
    selectedRadarCode: config.initialRadarCode,
    selectedIntervalInHours: config.initialTimeInterval,  // The chart show this amount of hours around selectedDate at noon
    timeDisplayedAs: "radarLocal" as TimeDisplayedAsValue,
    selectedLanguageCode: config.initialLanguageCode,
  }),
  actions: {
    setSelectedLanguageCode(code: LangCode) {
      this.selectedLanguageCode = code;
    },
    setSelectedRadarCode(code: string) {
      this.selectedRadarCode = code;
    },
    setSelectedIntervalInHours(interval: number) {
      this.selectedIntervalInHours = interval;
    },
    setTimeDisplayedAs(val: TimeDisplayedAsValue) {
      this.timeDisplayedAs = val;
    },
    setSelectedDate(val: string) {
      this.selectedDate = val;
    },
  },
  getters: {
    selectedLanguageLabel(): string {
      const found = useConfigStore().availableLanguages.find(
        d => d.code == this.selectedLanguageCode
      );

      return found ? found.label : config.initialLanguageCode;
    },

    startMoment(): moment.Moment {
      return moment(this.selectedDateNoon).subtract(
        this.selectedIntervalInHours / 2,
        "hours"
      );
    },

    endMoment(): moment.Moment {
      return moment(this.selectedDateNoon).add(
        this.selectedIntervalInHours / 2,
        "hours"
      );
    },

    selectedDateNoon(): moment.Moment {
      if (this.timeZoneToShow == "UTC") {
        // Noon UTC, if we are in UTC mode
        return moment
          .utc(this.selectedDate, "YYYY-MM-DD")
          .hour(12)
          .minute(0)
          .second(0);
      } else {
        // Noon at radar location, if we are in radarLocal mode. Parse the date in the radar's
        // zone: parsing in the browser's zone then converting shifted the window for viewers elsewhere.
        return moment
          .tz(this.selectedDate, "YYYY-MM-DD", this.timeZoneToShow)
          .hour(12)
          .minute(0)
          .second(0);
      }
    },

    timeZoneToShow(): string {
      if (this.timeDisplayedAs == "radarLocal") {
        return this.selectedRadarAsObject.timezone;
      } else {
        return "UTC";
      }
    },

    selectedIntervalStringId(): string {
      const found = useConfigStore().availableIntervals.find(
        d => d.value == this.selectedIntervalInHours
      );

      return found ? found.stringId : "";
    },

    selectedRadarAsObject(): RadarInterface {
      let found = useConfigStore().availableRadars[0].options[0];

      useConfigStore().availableRadars.forEach((radarGroup: GroupedRadarInterface) => {
        const groupFound = radarGroup.options.find(
          (d) => d.odimCode == this.selectedRadarCode
        );
        if (groupFound) {
          found = groupFound;
        }
      });

      return found;
    },
  },
});
