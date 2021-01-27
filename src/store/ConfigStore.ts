import config from "@/config";
import { GroupedRadarInterface, Language, TimeInterval } from "@/CrowTypes";
import { getModule, Module, VuexModule } from "vuex-module-decorators";
import store from "./index";

@Module({ dynamic: true, store, name: "conf" })
export class ConfigStore extends VuexModule {
  availableRadars: GroupedRadarInterface[] = config.availableRadars;
  availableIntervals: TimeInterval[] = config.availableTimeIntervals;
  availableLanguages: Language[] = config.availableLanguages;
}

export const ConfigStoreModule = getModule(ConfigStore);
