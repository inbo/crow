import config from '@/config';
import { GroupedRadarInterface } from '@/CrowTypes';
import { Module, VuexModule } from "vuex-module-decorators";

@Module({name: 'configStore'})
export default class ConfigStore extends VuexModule {
  availableRadars: GroupedRadarInterface[] = config.availableRadars;
}