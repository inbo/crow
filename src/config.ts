import { TimeInterval } from './TimeIntervaInterface';
import { GroupedRadarInterface } from './RadarInterface';

const globalAxisTimeFormat = " D-M@HH:mm z";  // See: https://momentjs.com/docs/#/displaying/

const globalChartMarginLeft = 65;
const globalChartMarginRight = 60;
const globalChartWidth = 1152 + globalChartMarginLeft + globalChartMarginRight;


export default {
    dataBaseUrl: 'https://crow.weernet.be',
    // TODO: remove the "country" property from individual radar entries and update the code so it gets that info from the group label instead
    availableRadars: [
        {
            label: 'Belgium',
            options: [
                { value: "behel", text: "Helchteren", country: "Belgium", latitude: 51.069199, longitude: 5.406138, timezone: 'Europe/Brussels' },
                { value: "bejab", text: "Jabbeke", country: "Belgium", latitude: 51.1919, longitude: 3.0641, timezone: 'Europe/Brussels' },
                { value: "bewid", text: "Wideumont", country: "Belgium", latitude: 49.9135, longitude: 5.5044, timezone: 'Europe/Brussels' },
                { value: "bezav", text: "Zaventem", country: "Belgium", latitude: 50.9054, longitude: 4.4579, timezone: 'Europe/Brussels' },
            ]
        },
        {
            label: 'Germany',
            options: [
                { value: "deess", text: "Essen", country: "Germany", latitude: 51.4055, longitude: 6.9669, timezone: 'Europe/Berlin' },
                { value: "denhb", text: "Neuheilenbach", country: "Germany", latitude: 50.1097, longitude: 6.5483, timezone: 'Europe/Berlin' }
            ]
        },
        {
            label: 'Netherlands',
            options: [
                { value: "nlhrw", text: "Herwijnen", country: "the Netherlands", latitude: 51.83708, longitude: 5.13797, timezone: 'Europe/Amsterdam' },
            ]
        }
    ] as GroupedRadarInterface[],

    initialRadarValue: 'behel',

    localizedDateFormat: "YYYY/MM/DD", // As returned by the browser when READING data from the "input type=date" field. TODO: Make it autodetected based on the locale?

    availableTimeIntervals: [
        { text: '1d', value: 24 },
        { text: '4d', value: 96 },
        { text: '1h', value: 1} // Only for debugging: intervals that are not multiple of 24h won't work properly with the time navigation logic
    ] as TimeInterval[],

    initialTimeInterval: 24,

    vtpsFormat: {
        availableHeights: [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800, 4000, 4200, 4400, 4600, 4800],
        temporalResolution: 5 * 60, // seconds
        numHeaderLines: 4
    },

    VPChartStyle: {
        margin: { top: 20, right: globalChartMarginRight, bottom: 30, left: globalChartMarginLeft },
        width: globalChartWidth, // TODO: rename to svgWidth so it's more clear (same for height and other charts)
        height: 300,

        showTooltip: false, // BEWARE: useful for debugging, but performance is horrible

        minDensityColor: '#f0f0f0',
        maxDensityColor: '#dc3545',
        noDataColor: 'white',

        axisTimeFormat: globalAxisTimeFormat,
        tooltipTimeFormat: "MMM D - HH:mm z",

        yAxisLeftTicks: [0, 1000, 2000, 3000, 4000] // Let's not show all altitudes (too crowded)
    },
    VPIChartStyle: {
        margin: { top: 15, right: globalChartMarginRight, bottom: 30, left: globalChartMarginLeft },
        width: globalChartWidth,
        height: 300,

        axisTimeFormat: " HH:mm z",
        tooltipTimeFormat: "MMM D - HH:mm z",

        lineColor: 'steelblue',

        showTooltip: true,
    },

    TimelineChartStyle: {
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        width: globalChartWidth - globalChartMarginLeft - globalChartMarginRight,
        height: 10,

        tooltipTimeFormat: "MMM D - HH:mm z",

        showTooltip: true,
    }
}