<template>
  <main>
    <Introduction />
    <b-container fluid="xl" class="mt-lg-5">
      <b-row>
        <b-col lg="3" class="bg-dark text-light pt-3">
          <b-form>
            <b-row>
              <b-col cols="12" sm="7" lg="12">
                <b-form-group
                  id="input-date-group"
                  :label="t('Date:')"
                  label-for="input-date"
                  :description="t('Charts are noon centered')"
                >
                  <b-input-group size="sm">
                    <b-input-group-prepend>
                      <b-button
                        variant="outline-secondary"
                        @click="decrementPeriod"
                      >
                        -{{ t(selectedIntervalStringId) }}
                      </b-button>
                    </b-input-group-prepend>
                    <b-form-input
                      id="input-date"
                      v-model="selectedDate"
                      type="date"
                      placeholder="Type a date..."
                      :max="todayAsString"
                    />
                    <b-input-group-append> 
                      <b-button
                        variant="outline-secondary"
                        @click="incrementPeriod"
                      >
                        +{{ t(selectedIntervalStringId) }}
                      </b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </b-col>

              <b-col cols="7" sm="2" lg="6">
                <b-form-group 
                  id="input-interval-group"
                  :label="t('Interval:')"
                  label-for="input-interval"
                >
                  <b-form-radio-group
                    id="input-interval"
                    v-model="selectedIntervalInHours"
                    size="sm"
                    buttons
                    button-variant="outline-secondary"
                    :options="availableIntervals"
                  />
                </b-form-group>
              </b-col>

              <b-col cols="5" sm="3" lg="6">
                <b-form-group 
                  id="input-timezone-group"
                  :label="t('Time zone:')"
                  label-for="input-timezone"
                >
                  <b-form-radio-group
                    id="input-timezone"
                    v-model="timeDisplayedAs"
                    size="sm"
                    buttons
                    button-variant="outline-secondary"
                  >
                    <b-form-radio value="radarLocal">
                      {{ t('Radar') }}
                    </b-form-radio>
                    <b-form-radio value="UTC">
                      {{ t('UTC') }}
                    </b-form-radio>
                  </b-form-radio-group>
                </b-form-group>
              </b-col>

              <b-col cols="7" lg="12">
                <site-selector />
              </b-col>

              <b-col cols="5" lg="12">
                <b-form-group 
                  id="copy-url-group"
                  :label="t('Share:')"
                >
                  <router-link
                    v-slot="{ href }"
                    append
                    :to="{ path: '/', query: { radar: selectedRadarValue, date: selectedDate, interval: selectedIntervalInHours, timedisplay: timeDisplayedAs, vpColorScheme: VPChartSelectedScheme, vpiMode: VPIChartMode }}"
                  >
                    <b-button 
                      v-clipboard:copy="`${baseUrl}${publicPath}${href}`"
                      v-clipboard:success="onCopyUrl"
                      size="sm"
                      variant="outline-primary"
                    >
                      {{ t(copyUrlButtonText) }}
                    </b-button>
                  </router-link>
                </b-form-group>
              </b-col>
            </b-row>
          </b-form>
        </b-col>

        <b-col lg="9" class="bg-light pt-3">
          <div v-if="readyForCharts">
            <v-p-chart
              :vtps-data="radarVtpsAsArray" 
              :show-time-as="timeZoneToShow"
              :style-config="VPChartStyle"
              :scheme="VPChartSelectedScheme"
              @color-scheme-changed="vpColorSchemeChanged"
            >
              <template #header>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <p class="small" v-html="t('VP chart description')" />
              </template>

              <template #in-x-axis-group>
                <timeline-chart
                  :periods="timePeriods"
                  :style-config="TimelineChartStyle"
                  :show-time-as="timeZoneToShow"
                />
              </template>
            </v-p-chart>

            <hr>

            <v-p-i-chart
              :vpi-data="integratedProfiles"
              :style-config="VPIChartStyle"
              :show-time-as="timeZoneToShow"
              :app-temporal-resolution="appTemporalResolution"
              :mode="VPIChartMode"
              @mode-changed="vpiModeChanged"
            >
              <template #header>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <p class="small" v-html="t('VPI chart description')" />
              </template>

              <template #in-x-axis-group>
                <timeline-chart
                  :periods="timePeriods"
                  :style-config="TimelineChartStyle"
                  :show-time-as="timeZoneToShow"
                />
              </template>
            </v-p-i-chart>
          </div>
        </b-col>
      </b-row>
    </b-container>
    <Partners />
  </main>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import VPChart from "@/components/VPChart.vue";
import VPIChart from "@/components/VPIChart.vue";
import SiteSelector from "@/components/SiteSelector.vue";
import TimelineChart from "@/components/TimelineChart.vue";
import Introduction from "@/components/Introduction.vue";
import Partners from "@/components/Partners.vue";

import moment from "moment-timezone";
import axios from "axios";
import SunCalc from "suncalc";

import config from "@/config";
import helpers from "@/helpers";

import { ColorSchemeIdentifier, IntegratedPropertyName, RadarInterface, VTPSDataRowFromFile, TimeInterval, TimeIntervalForRadioGroup, VTPSDataRow, VPIEntry, Period, TimeDisplayedAsValue, LangCode, MultilanguageStringContainer } from "@/CrowTypes";
import { UserChoicesStoreModule } from "@/store/UserChoicesStore";
import { ConfigStoreModule } from "@/store/ConfigStore";
import { mapMutations } from "vuex";

interface VTPSDataByHeight {
  [key: number]: VTPSDataRow;
}

interface RadarVTPSTreeEntry {
  heightData: VTPSDataByHeight;
  sunAltitude: number;
}

interface RadarVtpsAsTree {
  [key: number]: RadarVTPSTreeEntry;
}

const initialCopyUrlText = "Copy link";

export default Vue.extend({
  name: "Crow",
  components: {
    SiteSelector,
    VPChart,
    VPIChart,
    TimelineChart,
    Introduction,
    Partners
  },
  props: {
    radarValueProp: {
      type: String,
      default: config.initialRadarValue
    },
    dateValueProp: {
      type: String,
      default: config.initialDate
    },
    intervalValueProp: {
      type: Number,
      default: config.initialTimeInterval
    },
    timeDisplayValueProp: {
      type: String as PropType<TimeDisplayedAsValue>,
      default: config.initialTimeDisplay
    },
    vpChartSelectedSchemeProp: {
      type: String as () => ColorSchemeIdentifier,
      default: config.VPChartStyle.initialColorScheme
    },
    vpiChartModeProp: {
      type: String as () => IntegratedPropertyName,
      default: config.VPIChartStyle.initialMode
    }
  },
  data: function () {
    return {
      readyForCharts: false,

      VPChartStyle: config.VPChartStyle,
      VPChartSelectedScheme: this.vpChartSelectedSchemeProp as ColorSchemeIdentifier,
      VPIChartStyle: config.VPIChartStyle,
      VPIChartMode: this.vpiChartModeProp as IntegratedPropertyName,
      TimelineChartStyle: config.TimelineChartStyle,

      dataTemporalResolution: config.vtpsFormat.temporalResolution as number,
      appTemporalResolution: config.appTemporalResolution as number,
      availableHeights: config.vtpsFormat.availableHeights as number[],

      // Data is kept as an object for performance reasons, the "radarVtpsAsArray" computed property allows reading it as an array.
      // All timestamps are kept in UTC (transformed later, in the viz components)
      radarVtps: {} as RadarVtpsAsTree,

      publicPath: process.env.BASE_URL,
      baseUrl: "",
      copyUrlButtonText: initialCopyUrlText,
      texts: {
        "Date:": {
          en: "Date:",
          fr: "Date :",
          nl: "Datum:"
        },
        "1d": {
          en: "1d",
          fr: "1j",
          nl: "1d"
        },
        "3d": {
          en: "3d",
          fr: "3j",
          nl: "3d"
        },
        "Charts are noon centered": {
          en: "Charts will be centered on noon for the selected date.",
          fr: "Les graphiques seront centrés sur midi pour la date sélectionnée.",
          nl: "Grafieken worden gecentreerd op de middag van de geselecteerde datum."
        },
        "Interval:": {
          en: "Interval:",
          fr: "Intervalle :",
          nl: "Interval:"
        },
        "Time zone:": {
          en: "Time zone:",
          fr: "Fuseau horaire :",
          nl: "Tijdzone:"
        },
        "Radar": {
          en: "Radar",
          fr: "Radar",
          nl: "Radar"
        },
        "UTC": {
          en: "UTC",
          fr: "UTC",
          nl: "UTC"
        },
        "Share:": {
          en: "Share:",
          fr: "Partager :",
          nl: "Delen:"
        },
        "Copy link": {
          en: "Copy link",
          fr: "Copier le lien",
          nl: "Kopieer link"
        },
        "Link copied": {
          en: "Link copied",
          fr: "Le lien a été copié",
          nl: "Link gekopieerd"
        },
        "VP chart description": {
          en: "This chart shows <strong>bird density</strong> (colour) over time (x-axis) and height above the ground (y-axis). The BirdTAM colour scale is tailored to aviation.",
          fr: "Ce graphique montre la <strong>densité d'oiseaux</strong> en fonction du temps (axe x) et de la hauteur par rapport au sol (axe y). La palette de couleurs BirdTAM est conçue pour l'aviation.",
          nl: "Deze grafiek toont <strong>vogeldichtheid</strong> (kleur) in de tijd (x-as) en hoogte boven de grond (y-as). Het BirdTAM kleurenpalet is ontworpen voor de luchtvaart."
        },
        "VPI chart description": {
          en: "This chart shows the same information, but sums bird densities over height, thus giving a rough idea of the <strong>total number of birds</strong> in the sky at any given moment.",
          fr: "Ce graphique montre les mêmes informations, mais en additionant les densités par hauteur, ce qui donne une idée générale du <strong>nombre total d'oiseaux</strong> dans le ciel à un moment donné." ,
          nl: "Deze grafiek toont dezelfde informatie, waarbij de vogeldichtheden voor alle hoogtes worden opgeteld om zo een idee te geven van het <strong>totale aantal vogels</strong> in de lucht op een bepaald moment."
        }
      
      } as MultilanguageStringContainer
    };
  },
  computed: {
    startMoment(): moment.Moment {
      return UserChoicesStoreModule.startMoment;
    },

    endMoment(): moment.Moment {
      return UserChoicesStoreModule.endMoment;
    },

    selectedRadarValue(): string {
      return UserChoicesStoreModule.selectedRadarCode;
    },

    selectedLanguageCode(): LangCode {
      return UserChoicesStoreModule.selectedLanguageCode;
    },

    selectedDate: {
      get: function (): string {
        return UserChoicesStoreModule.selectedDate;
      },
      set: function (newValue: string) {
        UserChoicesStoreModule.setSelectedDate(newValue);
      }
    },

    timeDisplayedAs: {
      get: function (): TimeDisplayedAsValue {
        return UserChoicesStoreModule.timeDisplayedAs;
      },
      set: function (newValue: TimeDisplayedAsValue) {
        UserChoicesStoreModule.setTimeDisplayedAs(newValue);
      }
    },

    selectedIntervalInHours: {
      get: function (): number {
        return UserChoicesStoreModule.selectedIntervalInHours;
      },
      set: function (newValue: number) {
        UserChoicesStoreModule.setSelectedIntervalInHours(newValue);
      }
    },
    availableIntervals(): TimeIntervalForRadioGroup[] {
      return ConfigStoreModule.availableIntervals.map(i => {
        return {text: this.t(i.stringId), value: i.value}
      });
    },

    todayAsString(): string {
      return new Date().toISOString().split("T")[0];
    },
    selectedIntervalStringId(): string {
      return UserChoicesStoreModule.selectedIntervalStringId;
    },
    timeZoneToShow(): string {
      return UserChoicesStoreModule.timeZoneToShow;
    },
    timePeriods(): Period[] {
      // An array of all time periods currently shown (derived from radarVtps) with metadata such as the sun's position.
      const periods = [];

      for (const [timestamp, metadataObj] of Object.entries(this.radarVtps)) {
        periods.push({
          moment: moment.utc(+timestamp),
          sunAltitude: metadataObj.sunAltitude
        });
      }

      return periods;
    },
    selectedRadarLatitude(): number {
      return UserChoicesStoreModule.selectedRadarAsObject.latitude;
    },
    selectedRadarLongitude(): number {
      return UserChoicesStoreModule.selectedRadarAsObject.longitude;
    },
    radarVtpsAsArray(): VTPSDataRow[] {
      const dataArray = [];
      for (const [timestamp, metadataObj] of Object.entries(this.radarVtps)) {
        for (const [height, props] of Object.entries(metadataObj.heightData)) {
          const o = { timestamp: +timestamp, height: +height };
          dataArray.push({ ...o, ...(props as VTPSDataRow) });
        }
      }
      return dataArray;
    },
    integratedProfiles(): VPIEntry[] {
      const integratedProfiles = [] as VPIEntry[];
      for (const [timestamp, treeEntry] of Object.entries(this.radarVtps)) {
        // VTPS values are stored in a tree per height, we need a flat array for integratedProfile
        const dataToIntegrate = [];
        for (const [height, vtpsValues] of Object.entries(treeEntry.heightData)) {
          const o = { height: +height };
          dataToIntegrate.push({
            ...(vtpsValues as VTPSDataRowFromFile),
            ...o
          });
        }

        integratedProfiles.push({
          moment: moment.utc(+timestamp),
          integratedProfiles: helpers.integrateProfile(dataToIntegrate)
        });
      }
      return integratedProfiles;
    }
  },
  watch: {
    // Any change on something that can be shared via URL will reset the button
    selectedRadarValue: function (): void {
      this.resetCopyUrlButtonText();
      this.loadData();
    },
    selectedDate: function (): void {
      this.resetCopyUrlButtonText();
      this.loadData();
    },
    selectedIntervalInHours: function (): void {
      this.resetCopyUrlButtonText();
      this.loadData();
    },
    timeDisplayedAs: function (): void {
      this.resetCopyUrlButtonText();
      this.loadData();
    },
    VPChartSelectedScheme: function (): void {
      this.resetCopyUrlButtonText();
    },
    VPIChartMode: function (): void {
      this.resetCopyUrlButtonText();
    }
  },
  created: function () {
    this.initializeUserChoiceStore();
  },
  mounted: function () {
    this.baseUrl = this.trimLastSlash(window.location.origin);
  },
  methods: {
    t(stringId: string) {
      return helpers.translateString(stringId, this.selectedLanguageCode, this.texts);
    },
    initializeUserChoiceStore(): void {
      // Load initial values in the user choices store.
      // Props contains either parameters from the route, or default values from the config file.
      UserChoicesStoreModule.setSelectedRadarCode(this.radarValueProp);
      UserChoicesStoreModule.setSelectedIntervalInHours(this.intervalValueProp);
      UserChoicesStoreModule.setTimeDisplayedAs(this.timeDisplayValueProp);
      UserChoicesStoreModule.setSelectedDate(this.dateValueProp);
    },
    vpiModeChanged(mode: IntegratedPropertyName): void {
      this.VPIChartMode = mode;
    },
    vpColorSchemeChanged(schemeName: ColorSchemeIdentifier): void {
      this.VPChartSelectedScheme = schemeName;
    },
    trimLastSlash(s: string): string {
      return s.replace(/\/$/, "");
    },
    onCopyUrl(): void {
      this.copyUrlButtonText = "Link copied";
    },
    /* Initialize radarVtps with empty data 
       - The temporal range is [startMoment, endMoment] (resolution: appTemporalResolution - in seconds)
       - Heights follow availableHeights
    */
    initializeEmptyData(): void {
      // Remove existing data
      this.radarVtps = {} as RadarVtpsAsTree;

      const currentMoment = this.startMoment.clone();
      while (currentMoment.isBefore(this.endMoment)) {
        const heightObj = {} as VTPSDataByHeight;
        this.availableHeights.forEach(height => {
          heightObj[height] = { noData: true };
        });

        const metadataObj = {
          sunAltitude:
            SunCalc.getPosition(
              currentMoment.toDate(),
              this.selectedRadarLatitude,
              this.selectedRadarLongitude
            ).altitude *
            (180 / Math.PI), // In degrees
          heightData: heightObj
        };

        this.$set(
          this.radarVtps,
          currentMoment.toDate().getTime(),
          metadataObj
        );

        currentMoment.add(this.appTemporalResolution, "seconds");
      }
    },

    decrementPeriod(): void {
      this.selectedDate = moment(this.selectedDate, "YYYY-MM-DD")
        .subtract(this.selectedIntervalInHours, "hours")
        .format(moment.HTML5_FMT.DATE);
    },

    incrementPeriod(): void {
      this.selectedDate = moment(this.selectedDate, "YYYY-MM-DD")
        .add(this.selectedIntervalInHours, "hours")
        .format(moment.HTML5_FMT.DATE);
    },

    resetCopyUrlButtonText(): void {
      this.copyUrlButtonText = initialCopyUrlText;
    },

    loadData(): void {
      this.$nextTick(() => {
        this.readyForCharts = true;
        this.initializeEmptyData();
        this.populateDataFromCrowServer(
          this.selectedRadarValue,
          this.startMoment,
          this.endMoment
        );
      });
    },

    /* Store a Vtps data row originating in a file into vtpsData */
    storeDataRow(vtpsDataRow: VTPSDataRowFromFile): void {
      const objToStore = { ...vtpsDataRow, ...{ noData: false } };

      if ( // no (datetime) slot = data not copied. Allow automatic downsampling.
        Object.prototype.hasOwnProperty.call(
          this.radarVtps,
          vtpsDataRow.datetime
        )
      ) {
        this.$set(
          this.radarVtps[vtpsDataRow.datetime].heightData,
          vtpsDataRow.height,
          objToStore
        );
      }
    },

    getDatesForData(startMoment: moment.Moment, stopMoment: moment.Moment): string[] {
      // List the dates for which we'll need to load the data (according to startMoment and stopMoment)
      // Take into account the app temporal resolution and the upper limit (if resolution is 5 min and data shown until midgnight = data loaded until 23:55)
      //
      // Returns an array of strings in the 'YYYY-MM-DD' format
      startMoment = startMoment.utc() // Data files are in UTC
      stopMoment = stopMoment.subtract(this.appTemporalResolution, "seconds").utc();

      var dateArray: Set<string> = new Set;
      var currentDate = startMoment;

      while (currentDate <= stopMoment) {
        dateArray.add(moment(currentDate).format("YYYY-MM-DD"))
        currentDate = moment(currentDate).add(this.appTemporalResolution, "seconds");
      }
      return Array.from(dateArray);
    },

    /* for a given radar: iterate on days, load the data files from server and call storeDataRow() for each row */
    populateDataFromCrowServer(
      radarName: string,
      startMoment: moment.Moment,
      endMoment: moment.Moment
    ): void {
      for (let currentDate of this.getDatesForData(startMoment, endMoment)) {
        const url = this.buildDataUrl(radarName, moment(currentDate, "YYYY-MM-DD"));
        axios.get(url).then(response => {
          const dayData = helpers.parseVtps(response.data);

          for (const val of dayData) {
            this.storeDataRow(val);
          }
        });
      }
    },

    /* Build the data URL for a given day and radar */
    buildDataUrl(radarName: string, selectedDate: moment.Moment): string {
      return `${config.dataServerUrl}/${radarName}/${selectedDate.format(
        "YYYY"
      )}/${radarName}_vpts_${selectedDate.format("YYYYMMDD")}.txt`;
    },
    ...mapMutations([
      "setSelectedIntervalInHours"
    ])
  }
});
</script>
