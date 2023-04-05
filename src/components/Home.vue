<template>
  <main>
    <!-- <Introduction /> -->
    <b-container fluid="xl">
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
                    :to="{ path: '/', query: { radar: selectedRadarCode, date: selectedDate, interval: selectedIntervalInHours, timedisplay: timeDisplayedAs, vpiMode: VPIChartMode, vpColorScheme: VPChartSelectedScheme, lang: selectedLanguageCode}}"
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
                <p v-html="t('VPI chart description').replace('{{ birdsCount }}', totalNumberOfBirds)" />
              </template>

              <template #in-x-axis-group>
                <timeline-chart
                  :periods="timePeriods"
                  :style-config="TimelineChartStyle"
                  :show-time-as="timeZoneToShow"
                />
              </template>
            </v-p-i-chart>

            <hr>

            <v-p-chart
              :vpts-data="radarVptsAsArray"
              :show-time-as="timeZoneToShow"
              :style-config="VPChartStyle"
              :scheme="VPChartSelectedScheme"
              @color-scheme-changed="vpColorSchemeChanged"
            >
              <template #header>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <p v-html="t('VP chart description')" />
              </template>

              <template #in-x-axis-group>
                <timeline-chart
                  :periods="timePeriods"
                  :style-config="TimelineChartStyle"
                  :show-time-as="timeZoneToShow"
                />
              </template>
            </v-p-chart>
          </div>
        </b-col>
      </b-row>
    </b-container>
    <Partners />
  </main>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import VPIChart from "@/components/VPIChart.vue";
import VPChart from "@/components/VPChart.vue";
import SiteSelector from "@/components/SiteSelector.vue";
import TimelineChart from "@/components/TimelineChart.vue";
// import Introduction from "@/components/Introduction.vue";
import Partners from "@/components/Partners.vue";

import moment from "moment-timezone";
import axios from "axios";
import SunCalc from "suncalc";

import config from "@/config";
import helpers from "@/helpers";

import { ColorSchemeIdentifier, IntegratedPropertyName, VPTSDataRowFromFile, TimeIntervalForRadioGroup, VPTSDataRow, VPIEntry, Period, TimeDisplayedAsValue, LangCode, MultilanguageStringContainer, Language, RadarInterface } from "@/CrowTypes";
import { UserChoicesStoreModule } from "@/store/UserChoicesStore";
import { ConfigStoreModule } from "@/store/ConfigStore";
import { mapMutations } from "vuex";

interface VPTSDataByHeight {
  [key: number]: VPTSDataRow;
}

interface RadarVPTSTreeEntry {
  heightData: VPTSDataByHeight;
  sunAltitude: number;
}

interface RadarVptsAsTree {
  [key: number]: RadarVPTSTreeEntry;
}

const initialCopyUrlText = "Copy link";

export default Vue.extend({
  name: "Home",
  components: {
    SiteSelector,
    VPIChart,
    VPChart,
    TimelineChart,
    // Introduction,
    Partners
  },
  props: {
    radarValueProp: {
      type: String,
      default: config.initialRadarCode
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
    vpiChartModeProp: {
      type: String as () => IntegratedPropertyName,
      default: config.VPIChartStyle.initialMode
    },
    vpChartSelectedSchemeProp: {
      type: String as () => ColorSchemeIdentifier,
      default: config.VPChartStyle.initialColorScheme
    },
    langCodeProp: {
      type: String as () => LangCode,
      default: null
    }
  },
  data: function () {
    return {
      readyForCharts: false,

      VPIChartStyle: config.VPIChartStyle,
      VPIChartMode: this.vpiChartModeProp as IntegratedPropertyName,
      VPChartStyle: config.VPChartStyle,
      VPChartSelectedScheme: this.vpChartSelectedSchemeProp as ColorSchemeIdentifier,
      TimelineChartStyle: config.TimelineChartStyle,

      appTemporalResolution: config.appTemporalResolution as number,

      // Data is kept as an object for performance reasons, the "radarVptsAsArray" computed property allows reading it as an array.
      // All timestamps are kept in UTC (transformed later, in the viz components)
      radarVpts: {} as RadarVptsAsTree,

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
        "VPI chart description": {
          en: "This chart shows the <strong>total number of birds</strong> passing at any given moment over the radar. In total about <strong>{{ birdsCount }} birds</strong> flew across a 1 km line during the time shown.",
          fr: "Ce graphique montre le <strong>nombre total d'oiseaux</strong> passant à un moment donné au dessus du radar. Au total, environ <strong>{{ birdsCount }} oiseaux</strong> ont traversé une ligne d'un kilomètre de large pendant la période affichée.",
          nl: "Deze grafiek toont het <strong>totale aantal vogels</strong> dat op een bepaald moment over de radar passeert. In totaal vlogen ongeveer <strong>{{ birdsCount }} vogels</strong> over een breedte van 1 km in de weergegeven tijd."
        },
        "VP chart description": {
          en: "This chart shows the measured <strong>bird density</strong> (colour: birds/km³) per height above mean sea level. The BirdTAM colour scale is tailored to aviation.",
          fr: "Ce graphique montre la <strong>densité mesurée d'oiseaux</strong> (couleur: nombre d'oiseaux/km³) en fonction de l'altitude (par rapport au niveau de la mer). La palette de couleurs BirdTAM est conçue pour l'aviation.",
          nl: "Deze grafiek toont de gemeten <strong>vogeldichtheid</strong> (kleur: vogels/km³) in functie van hoogte boven zeeniveau. Het BirdTAM kleurenpalet is ontworpen voor de luchtvaart."
        }
      } as MultilanguageStringContainer
    };
  },
  computed: {
    availableLanguages(): Language[] {
      return ConfigStoreModule.availableLanguages;
    },

    startMoment(): moment.Moment {
      return UserChoicesStoreModule.startMoment;
    },

    endMoment(): moment.Moment {
      return UserChoicesStoreModule.endMoment;
    },

    selectedRadarCode(): string {
      return this.selectedRadar.odimCode;
    },

    selectedRadar(): RadarInterface {
      return UserChoicesStoreModule.selectedRadarAsObject;
    },

    selectedLanguageCode(): LangCode {
      return UserChoicesStoreModule.selectedLanguageCode;
    },

    selectedDate: {
      get: function (): string {
        return UserChoicesStoreModule.selectedDate;
      },
      set: function (newValue: string): void {
        UserChoicesStoreModule.setSelectedDate(newValue);
      }
    },

    timeDisplayedAs: {
      get: function (): TimeDisplayedAsValue {
        return UserChoicesStoreModule.timeDisplayedAs;
      },
      set: function (newValue: TimeDisplayedAsValue): void {
        UserChoicesStoreModule.setTimeDisplayedAs(newValue);
      }
    },

    selectedIntervalInHours: {
      get: function (): number {
        return UserChoicesStoreModule.selectedIntervalInHours;
      },
      set: function (newValue: number): void {
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
      // An array of all time periods currently shown (derived from radarVpts) with metadata such as the sun's position.
      const periods = [];

      for (const [timestamp, metadataObj] of Object.entries(this.radarVpts)) {
        periods.push({
          moment: moment.utc(+timestamp),
          sunAltitude: metadataObj.sunAltitude
        });
      }

      return periods;
    },
    radarVptsAsArray(): VPTSDataRow[] {
      const dataArray = [];
      for (const [timestamp, metadataObj] of Object.entries(this.radarVpts)) {
        for (const [height, props] of Object.entries(metadataObj.heightData)) {
          const o = { timestamp: +timestamp, height: +height };
          dataArray.push({ ...o, ...(props as VPTSDataRow) });
        }
      }
      return dataArray;
    },
    totalNumberOfBirds(): number {
      // see https://github.com/inbo/crow/issues/112
      // Build an array of all MTRs for the selected period
      let mtrArray = this.integratedProfiles.map(vpiEntry => { return vpiEntry.integratedProfiles.mtr })

      // Remove NaN values
      mtrArray = mtrArray.filter(value => { return !Number.isNaN(value); });

      // Process average
      const mtrArrayAverage = mtrArray.reduce((a,b) => a + b, 0) / mtrArray.length;

      // Multiply per number of hours, round to hundreds and return
      const roundHundred = (value:number) => Math.round(value/100)*100;
      return roundHundred(mtrArrayAverage * this.selectedIntervalInHours);
    },

    integratedProfiles(): VPIEntry[] {
      const integratedProfiles = [] as VPIEntry[];
      for (const [timestamp, treeEntry] of Object.entries(this.radarVpts)) {
        // VPTS values are stored in a tree per height, we need a flat array for integratedProfile
        const dataToIntegrate = [];
        for (const [height, vptsValues] of Object.entries(treeEntry.heightData)) {
          const o = { height: +height };
          dataToIntegrate.push({
            ...(vptsValues as VPTSDataRowFromFile),
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
    selectedRadarCode: function (): void {
      this.resetCopyUrlButtonText();
      this.loadData();
    },
    selectedDate: function (): void {
      if (moment(this.selectedDate, "YYYY-MM-DD").isValid() === true) { // Date can temporarily be incorrect while manually changing (typing in) the date field
        this.resetCopyUrlButtonText();
        this.loadData();
      }
    },
    selectedIntervalInHours: function (): void {
      this.resetCopyUrlButtonText();
      this.loadData();
    },
    timeDisplayedAs: function (): void {
      this.resetCopyUrlButtonText();
      this.loadData();
    },
    VPIChartMode: function (): void {
      this.resetCopyUrlButtonText();
    },
    VPChartSelectedScheme: function (): void {
      this.resetCopyUrlButtonText();
    },
    selectedLanguageCode: function (): void {
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
    t(stringId: string): string {
      return helpers.translateString(stringId, this.selectedLanguageCode, this.texts);
    },
    chooseAppLanguage() : LangCode {
      let selectedLangCode = config.initialLanguageCode as string; // Default/fallback choice

      if (this.langCodeProp) { // Override choice if we have an explicitly request in the URL
        selectedLangCode = this.langCodeProp
      } else {
        // Override according to the browser settings
        const browserCode = helpers.getBrowserFirstLangCode()
        if (browserCode) {
          if (this.availableLanguages.map(l => l.code as string).includes(browserCode)) {
            selectedLangCode = browserCode;
          }
        }
      }
      return selectedLangCode as LangCode;
    },
    initializeUserChoiceStore(): void {
      // Load initial values in the user choices store.
      // Props contains either parameters from the route, or default values from the config file.
      UserChoicesStoreModule.setSelectedRadarCode(this.radarValueProp);
      UserChoicesStoreModule.setSelectedIntervalInHours(this.intervalValueProp);
      UserChoicesStoreModule.setTimeDisplayedAs(this.timeDisplayValueProp);
      UserChoicesStoreModule.setSelectedDate(this.dateValueProp);
      UserChoicesStoreModule.setSelectedLanguageCode(this.chooseAppLanguage());
    },
    vpColorSchemeChanged(schemeName: ColorSchemeIdentifier): void {
      this.VPChartSelectedScheme = schemeName;
    },
    vpiModeChanged(mode: IntegratedPropertyName): void {
      this.VPIChartMode = mode;
    },
    trimLastSlash(s: string): string {
      return s.replace(/\/$/, "");
    },
    onCopyUrl(): void {
      this.copyUrlButtonText = "Link copied";
    },
    /* Initialize radarVpts with empty data
       - The temporal range is [startMoment, endMoment] (resolution: appTemporalResolution - in seconds)
       - Heights depend on the radar configuration
    */
    initializeEmptyData(): void {
      // Remove existing data
      this.radarVpts = {} as RadarVptsAsTree;

      const currentMoment = this.startMoment.clone();
      while (currentMoment.isBefore(this.endMoment)) {
        const heightObj = {} as VPTSDataByHeight;
        this.selectedRadar.heights.forEach(height => {
          heightObj[height] = { noData: true };
        });

        const metadataObj = {
          sunAltitude:
            SunCalc.getPosition(
              currentMoment.toDate(),
              this.selectedRadar.latitude,
              this.selectedRadar.longitude
            ).altitude *
            (180 / Math.PI), // In degrees
          heightData: heightObj
        };

        this.$set(
          this.radarVpts,
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
          this.selectedRadar,
          this.startMoment,
          this.endMoment
        );
      });
    },

    /* Store a Vpts data row originating in a file into vptsData */
    storeDataRow(vptsDataRow: VPTSDataRowFromFile): void {
      const objToStore = { ...vptsDataRow, ...{ noData: false } };

      if ( // no (datetime) slot = data not copied. Allow automatic downsampling.
        Object.prototype.hasOwnProperty.call(
          this.radarVpts,
          vptsDataRow.datetime
        )
      ) {
          this.$set(
            this.radarVpts[vptsDataRow.datetime].heightData,
            vptsDataRow.height,
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
      radar: RadarInterface,
      startMoment: moment.Moment,
      endMoment: moment.Moment
    ): void {
      for (let currentDate of this.getDatesForData(startMoment, endMoment)) {
        const url = helpers.buildVpTsDataUrl(radar, moment(currentDate, "YYYY-MM-DD"));
        axios.get(url).then(response => {
          // Data are floored to resolution of app (`parseVol2birdVpts()`), which can create multiple entries with the same datetime index
          // In this section:
          //  1/ Data are grouped per datetime (e.g. 10min app resolution and 5min data resolution => all heights occur twice)
          //  2/ For each datetime, first record of each height is taken
          //  3/ Individual (datetime) groups (each with all unique heights) are flattened again into single Array
          //  4/ Nan-values are filtered out from the flattened Array to pass to app
          const dayData = helpers.filterVpts(
            Object.entries(
              helpers.groupBy(
                helpers.parseVpts(response.data, radar.vptsFileFormat), x => x.datetime)
            )
            .map(x => x[1].slice(0, this.selectedRadar.heights.length))
            .flat()
          )
          for (const val of dayData) {
            this.storeDataRow(val);
          }
        });
      }
    },
    ...mapMutations([
      "setSelectedIntervalInHours"
    ])
  }
});
</script>
