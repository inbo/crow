import config from "@/config";
import { GroupedRadarInterface, Language, TimeInterval } from "@/CrowTypes";
import { getModule, Module, VuexModule } from "vuex-module-decorators";
import store from "./index";

@Module({ dynamic: true, store, name: "conf" })
export class ConfigStore extends VuexModule {
  availableIntervals: TimeInterval[] = config.availableTimeIntervals;
  availableLanguages: Language[] = config.availableLanguages;

  get availableRadars(): GroupedRadarInterface[] {
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

export const ConfigStoreModule = getModule(ConfigStore);
