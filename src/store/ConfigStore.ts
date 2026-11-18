import config from "@/config";
import { GroupedRadarInterface } from "@/CrowTypes";
import { defineStore } from "pinia";

export const useConfigStore = defineStore("conf", {
  state: () => ({
    availableIntervals: config.availableTimeIntervals,
    availableLanguages: config.availableLanguages,
  }),
  getters: {
    availableRadars(): GroupedRadarInterface[] {
      return config.availableRadars.map(radarGroup => {
        return {
          label: radarGroup.label,
          options: radarGroup.options.map(radar => {
            let displayLabel = radar.text;
            if ('radarLabelIncludesCode' in config && config["radarLabelIncludesCode"] === true) {
              displayLabel = radar.odimCode + " - " + radar.text;
            }

            return {
              ...radar, displayLabel: displayLabel
            }
          })
        }
      });
    }
  }
});
