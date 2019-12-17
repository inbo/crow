import _ from 'lodash';

export default {
    dataBaseUrl: 'https://crow.weernet.be',
    availableRadars: [
        { value: "behel", text: "Behel?", country: "Belgium" },
        { value: "bejab", text: "Jabbeke", country: "Belgium" },
        { value: "bezav", text: "Zaventem", country: "Belgium" },
        { value: "bewid", text: "Wideumont", country: "Belgium" },
        { value: "nldhl", text: "Den Helder", country: "the Netherlands" }
    ],
    initialRadarCode: 'behel',
    localizedDateFormat: "YYYY/MM/DD", // As returned by the browser when READING data from the "input type=date" field. TODO: Make it autodetected based on the locale?

    vtpsFormat: {
        availableHeights: _.range(0, 4800 + 1, 200), // From 0 to 4800 meters, by increment of 200
        temporalResolution: 5 * 60, // seconds
        numHeaderLines: 4
    },

    VPChartStyle: {
        margin: { top: 0, right: 30, bottom: 30, left: 65 },
        width: 1100,
        height: 300,

        minDensityColor: '#f0f0f0',
        maxDensityColor: '#dc3545',
        noDataColor: 'white',
    },
    VPIChartStyle: {
        margin: { top: 0, right: 30, bottom: 30, left: 65 },
        width: 1100,
        height: 300,
    }
}