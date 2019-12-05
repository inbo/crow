export default {
    dataBaseUrl: 'http://crow.weernet.be',
    availableRadars: [
        { value: "behel", text: "Behel?", country: "Belgium" },
        { value: "bejab", text: "Jabbeke", country: "Belgium" },
        { value: "bezav", text: "Zaventem", country: "Belgium" },
        { value: "bewid", text: "Wideumont", country: "Belgium" },
        { value: "nldhl", text: "Den Helder", country: "the Netherlands" }
    ],
    initialRadarCode: 'behel',
    localizedDateFormat: "YYYY/MM/DD", // As returned by the browser when READING data from the "input type=date" field. TODO: Make it autodetected based on the locale?
}