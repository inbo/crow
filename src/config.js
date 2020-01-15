import _ from 'lodash';

export default {
    dataBaseUrl: 'https://crow.weernet.be',
    availableRadars: [
        // Radar metadata available at: https://www.eumetnet.eu/wp-content/themes/aeron-child/observations-programme/current-activities/opera/database/OPERA_Database/index.html
        { ODIMCode: "behel", location: "Behel?", country: "Belgium", latitude: 51.069199, longitude: 5.406138 },
        { ODIMCode: "bejab", location: "Jabbeke", country: "Belgium", latitude: 51.1919, longitude: 3.0641 },
        { ODIMCode: "bezav", location: "Zaventem", country: "Belgium", latitude: 50.9054, longitude: 4.4579 },
        { ODIMCode: "bewid", location: "Wideumont", country: "Belgium", latitude: 49.9135, longitude: 5.5044 },
        { ODIMCode: "nlhrw", location: "Herwijnen", country: "the Netherlands", latitude: 51.83708, longitude: 5.13797 },
        { ODIMCode: "deess", location: "Essen", country: "Germany", latitude: 51.4055, longitude: 6.9669 },
        { ODIMCode: "denhb", location: "Neuheilenbach", country: "Germany", latitude: 50.1097, longitude: 6.5483 },
    ].sort((a, b) => (a.location > b.location) ? 1 : -1), // Sort by location for nicer display

    initialRadarODIMCode: 'behel',
    localizedDateFormat: "YYYY/MM/DD", // As returned by the browser when READING data from the "input type=date" field. TODO: Make it autodetected based on the locale?

    vtpsFormat: {
        availableHeights: _.range(0, 4800 + 1, 200), // From 0 to 4800 meters, by increment of 200
        temporalResolution: 5 * 60, // seconds
        numHeaderLines: 4
    },

    VPChartStyle: {
        margin: { top: 0, right: 60, bottom: 30, left: 65 },
        width: 1100,
        height: 300,

        minDensityColor: '#f0f0f0',
        maxDensityColor: '#dc3545',
        noDataColor: 'white',
    },
    VPIChartStyle: {
        margin: { top: 0, right: 60, bottom: 30, left: 65 },
        width: 1100,
        height: 300,
    },

    TimelineChartStyle: {
        margin: { top: 0, right: 60, bottom: 5, left: 65 },
        width: 1100,
        height: 30,

        showXAxis: false,
        showTooltip: true,

        dayColor: '#dae9fe',
        twilightColor: '#4771bb',
        nightColor: '#1e252d'
    }
}