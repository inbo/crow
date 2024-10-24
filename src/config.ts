import moment from "moment";
import { ColorSchemeIdentifier, GroupedRadarInterface, IntegratedPropertyName, LangCode, Language, TimeDisplayedAsValue, TimeInterval } from "./CrowTypes";

const globalChartMarginLeft = 65; // In-svg margin used for axis and legend
const globalChartMarginRight = 60; // In-svg margin used for axis and legend
const svgWidth = 72 * (60 / 10 * 1.5) + globalChartMarginLeft + globalChartMarginRight;
// The chart width (svgWidth) should have enough pixels to display:
// - max number of visible hours (72, see availableTimeIntervals)
// - resolution per hour (60 / appTemporalResolution in minutes)
// - an optional multiplier to scale up or down (1.5)

const meteoBeUrlTemplate = 'https://opendata.meteo.be/ftp/observations/radar/vbird/{odimCode}/{yyyy}/{odimCode}_vpts_{yyyymmdd}.txt'
const availableHeights = [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800, 4000, 4200, 4400, 4600, 4800];

export default {
  availableLanguages: [
    { label: "English", code: "en" },
    { label: "Nederlands", code: "nl" },
    { label: "Français", code: "fr"}
  ] as Language[],
  initialLanguageCode: "en" as LangCode,
  radarLabelIncludesCode: false,
  availableRadars: [
    {
      label: "Belgium",
      options: [
        { odimCode: "behel", text: "Helchteren", latitude: 51.069199, longitude: 5.406138, timezone: "Europe/Brussels", endpoint: meteoBeUrlTemplate, heights: availableHeights, vptsFileFormat: 'VOL2BIRD' },
        { odimCode: "bejab", text: "Jabbeke", latitude: 51.1919, longitude: 3.0641, timezone: "Europe/Brussels", endpoint: meteoBeUrlTemplate, heights: availableHeights, vptsFileFormat: 'VOL2BIRD' },
        { odimCode: "bewid", text: "Wideumont", latitude: 49.9135, longitude: 5.5044, timezone: "Europe/Brussels", endpoint: meteoBeUrlTemplate, heights: availableHeights, vptsFileFormat: 'VOL2BIRD' },
        { odimCode: "bezav", text: "Zaventem", latitude: 50.9054, longitude: 4.4579, timezone: "Europe/Brussels", endpoint: meteoBeUrlTemplate, heights: availableHeights, vptsFileFormat: 'VOL2BIRD', hideOnMap: false },
      ]
    },
    {
      label: "France",
      options: [
        { odimCode: "frabb", text: "Abbeville", latitude: 50.1360, longitude: 1.8347, timezone: "Europe/Paris", endpoint: meteoBeUrlTemplate, heights: availableHeights, vptsFileFormat: 'VOL2BIRD' },
        { odimCode: "frave", text: "Avesnes", latitude: 50.1283, longitude: 3.8118, timezone: "Europe/Paris", endpoint: meteoBeUrlTemplate, heights: availableHeights, vptsFileFormat: 'VOL2BIRD' },
      ]
    },
    {
      label: "Germany",
      options: [
        { odimCode: "deess", text: "Essen", latitude: 51.4055, longitude: 6.9669, timezone: "Europe/Berlin", endpoint: meteoBeUrlTemplate, heights: availableHeights, vptsFileFormat: 'VOL2BIRD' },
        { odimCode: "denhb", text: "Neuheilenbach", latitude: 50.1097, longitude: 6.5483, timezone: "Europe/Berlin", endpoint: meteoBeUrlTemplate, heights: availableHeights, vptsFileFormat: 'VOL2BIRD' }
      ]
    },
    {
      label: "Netherlands",
      options: [
        { odimCode: "nldhl", text: "Den Helder", latitude: 52.9533, longitude: 4.7899, timezone: "Europe/Amsterdam", endpoint: meteoBeUrlTemplate, heights: availableHeights, vptsFileFormat: 'VOL2BIRD' },
        { odimCode: "nlhrw", text: "Herwijnen", latitude: 51.83708, longitude: 5.13797, timezone: "Europe/Amsterdam", endpoint: meteoBeUrlTemplate, heights: availableHeights, vptsFileFormat: 'VOL2BIRD' },
      ]
    }
  ] as GroupedRadarInterface[],

  initialRadarCode: "behel",

  availableTimeIntervals: [
    { stringId: "1d", value: 24 },
    { stringId: "3d", value: 72 },
    //{ text: "1h", value: 1 } // Only for debugging: intervals that are not multiple of 24h won't work properly with the time navigation logic
  ] as TimeInterval[],

  initialTimeInterval: 24,
  initialDate: moment().subtract(1, "days").format(moment.HTML5_FMT.DATE),

  initialTimeDisplay: "radarLocal" as TimeDisplayedAsValue,

  appTemporalResolution: 10 * 60, // seconds (this is the resolution we use for calculation and display) Should be a multiple of the data (vpts file) temporal resolution for downsampling, or equal if we want to show data at the highest resolution

  VPChartStyle: {
    margin: { top: 20, right: globalChartMarginRight, bottom: 30, left: globalChartMarginLeft },
    width: svgWidth,
    height: 300,

    showTooltip: false, // BEWARE: useful for debugging, but performance is horrible

    noDataColor: "#C0C0C0",

    // The BirdTAM color scale: code + associated color
    birdtamColors: new Map([
      [0, "#ffffff"],
      [1, "#e5ffe5"],
      [2, "#ccffcc"],
      [3, "#b2ffb2"],
      [4, "#99ff99"],
      [5, "#00ff00"],
      [6, "#ffff00"],
      [7, "#ffb2b2"],
      [8, "#ff0000"],
      [9, "#333333"],
    ]),

    axisTimeFormat: "HH:mm z",
    tooltipTimeFormat: "MMM D - HH:mm z",

    initialColorScheme: "viridis" as ColorSchemeIdentifier,
  },
  VPIChartStyle: {
    margin: { top: 15, right: globalChartMarginRight, bottom: 30, left: globalChartMarginLeft },
    width: svgWidth,
    height: 300,

    axisTimeFormat: "HH:mm z",
    tooltipTimeFormat: "MMM D - HH:mm z",

    strokeColor: "#007bff", // Bootstrap link colour
    fillColor: "#cfe2ff", // Bootstrap primary background colour
    strokeWidth: 1,

    showTooltip: true,
    initialMode: "mtr" as IntegratedPropertyName
  },

  TimelineChartStyle: {
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    width: svgWidth - globalChartMarginLeft - globalChartMarginRight, // This chart is embedded into the main charts, and should be as long as the X axis
    height: 10,

    tooltipTimeFormat: "MMM D - HH:mm z",

    showTooltip: true,
  }
}
