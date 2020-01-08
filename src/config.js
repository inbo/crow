import _ from 'lodash';

export default {
    dataBaseUrl: 'https://crow.weernet.be',
    availableRadars: [
        // TODO: validate/fix radar coordinates
        { value: "behel", text: "Behel?", country: "Belgium", latitude: 51.0743268, longitude: 5.3844822 },
        { value: "bejab", text: "Jabbeke", country: "Belgium", latitude: 51.1846386, longitude: 3.0902954},
        { value: "bezav", text: "Zaventem", country: "Belgium", latitude: 50.8806207, longitude: 4.4730008},
        { value: "bewid", text: "Wideumont", country: "Belgium", latitude: 49.9257163, longitude: 5.485025},
        { value: "nldhl", text: "Den Helder", country: "the Netherlands", latitude: 52.9529894, longitude: 4.8267592}
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
    },

    TimelineChartStyle: {
        margin: { top: 0, right: 30, bottom: 30, left: 65 },
        width: 1100,
        height: 50,

        dayColor: '#dae9fe',
        twilightColor: '#4771bb',
        nightColor: '#1e252d'
    }
}