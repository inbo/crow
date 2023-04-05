import moment from "moment";
import { ColorSchemeIdentifier, GroupedRadarInterface, IntegratedPropertyName, LangCode, Language, TimeDisplayedAsValue, TimeInterval } from "./CrowTypes";

const globalChartMarginLeft = 65; // In-svg margin used for axis and legend
const globalChartMarginRight = 60; // In-svg margin used for axis and legend
const svgWidth = 72 * (60 / 15 * 2.5) + globalChartMarginLeft + globalChartMarginRight;
// The chart width (svgWidth) should have enough pixels to display:
// - max number of visible hours (72, see availableTimeIntervals)
// - resolution per hour (60 / appTemporalResolution in minutes)
// - an optional multiplier to scale up or down (1.5)

const meteoBeUrlTemplate = 'https://opendata.meteo.be/ftp/observations/radar/vbird/{odimCode}/{yyyy}/{odimCode}_vpts_{yyyymmdd}.txt'
const aloftBaltradUrl = "https://aloft.s3-eu-west-1.amazonaws.com/baltrad/daily/{odimCode}/{yyyy}/{odimCode}_vpts_{yyyymmdd}.csv"
const availableHeights = [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800, 4000, 4200, 4400, 4600, 4800];

export default {
  availableLanguages: [
    { label: "English", code: "en" },
    { label: "Nederlands", code: "nl" },
    { label: "Français", code: "fr"}
  ] as Language[],
  initialLanguageCode: "en" as LangCode,
  availableRadars: [
    {
      label: "Belgium",
      options: [
        { odimCode: "bejab", text: "Jabbeke", latitude: 51.1919, longitude: 3.0641, timezone: "Europe/Brussels", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "bewid", text: "Wideumont", latitude: 49.9135, longitude: 5.5044, timezone: "Europe/Brussels", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" }
      ]
    },
    {
      label: "Croatia",
      options: [
        { odimCode: "hrbil", text: "Bilogora", latitude: 45.8835, longitude: 17.2005, timezone: "Europe/Zagreb", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "hrzag", text: "Puntijarka", latitude: 45.9078, longitude: 15.9683, timezone: "Europe/Zagreb", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" }
      ]
    },
    {
      label: "Czech Republic",
      options: [
        { odimCode: "czbrd", text: "Brdy-Praha", latitude: 49.6583, longitude: 13.8178, timezone: "Europe/Prague", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "czska", text: "Skalky", latitude: 49.5011, longitude: 16.7885, timezone: "Europe/Prague", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" }
      ]
    },
    {
      label: "Denmark",
      options: [
        { odimCode: "dkbor", text: "Bornholm", latitude: 55.1127, longitude: 14.8875, timezone: "Europe/Copenhagen", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "dkrom", text: "Römö", latitude: 55.1731, longitude: 8.552, timezone: "Europe/Copenhagen", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "dksin", text: "Sindal", latitude: 57.4893, longitude: 10.1365, timezone: "Europe/Copenhagen", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "dkste", text: "Stevns", latitude: 55.3262, longitude: 12.4493, timezone: "Europe/Copenhagen", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "dkvir", text: "Virring", latitude: 56.024, longitude: 10.0246, timezone: "Europe/Copenhagen", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" }
      ]
    },
    {
      label: "Estonia",
      options: [
        { odimCode: "eehar", text: "Harku", latitude: 59.3977, longitude: 24.6021, timezone: "Europe/Tallinn", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "eesur", text: "Sürgavere", latitude: 58.4823, longitude: 25.5187, timezone: "Europe/Tallinn", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" }
      ]
    },
    {
      label: "Finland",
      options: [
        { odimCode: "fianj", text: "Anjalankoski", latitude: 60.9039, longitude: 27.1081, timezone: "Europe/Helsinki", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "fiika", text: "Ikaalinen", latitude: 61.7673, longitude: 23.0764, timezone: "Europe/Helsinki", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "fikes", text: "Kesälahti", latitude: 61.9069, longitude: 29.7977, timezone: "Europe/Helsinki", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "fikor", text: "Korpo", latitude: 60.1285, longitude: 21.6434, timezone: "Europe/Helsinki", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "fikuo", text: "Kuopio", latitude: 62.8626, longitude: 27.3815, timezone: "Europe/Helsinki", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "filuo", text: "Luosto", latitude: 67.1391, longitude: 26.8969, timezone: "Europe/Helsinki", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "finur", text: "Nurmes", latitude: 63.8378, longitude: 29.4489, timezone: "Europe/Helsinki", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "fipet", text: "Petäjävesi", latitude: 62.3045, longitude: 25.4401, timezone: "Europe/Helsinki", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "fiuta", text: "Utajärvi", latitude: 64.7749, longitude: 26.3189, timezone: "Europe/Helsinki", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "fivan", text: "Vantaa", latitude: 60.2706, longitude: 24.869, timezone: "Europe/Helsinki", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "fivih", text: "Vihti", latitude: 60.5562, longitude: 24.4956, timezone: "Europe/Helsinki", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "fivim", text: "Vimpeli", latitude: 63.1048, longitude: 23.8209, timezone: "Europe/Helsinki", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" }
      ]
    },
    {
      label: "France",
      options: [
        { odimCode: "frabb", text: "Abbeville", latitude: 50.136, longitude: 1.8347, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "fraja", text: "Ajaccio", latitude: 41.9531, longitude: 8.7005, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frale", text: "Aléria", latitude: 42.1298, longitude: 9.4964, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frave", text: "Avesnes", latitude: 50.1283, longitude: 3.8118, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frtro", text: "Arcis-sur-Aube", latitude: 48.4621, longitude: 4.3093, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frbla", text: "Blaisy-Haut", latitude: 47.3552, longitude: 4.7759, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frbol", text: "Bollène", latitude: 44.323, longitude: 4.7621, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frbor", text: "Bordeaux", latitude: 44.8315, longitude: -0.6919, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frbou", text: "Bourges", latitude: 47.0586, longitude: 2.3595, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frcae", text: "Falaise", latitude: 48.9272, longitude: -0.1496, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frche", text: "Cherves", latitude: 46.6986, longitude: 0.0656, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frcol", text: "Collobrières", latitude: 43.2166, longitude: 6.3729, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frgre", text: "Grèzes", latitude: 45.1044, longitude: 1.3697, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frlep", text: "Sembadel", latitude: 45.2892, longitude: 3.7095, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frmau", text: "Mont Maurel", latitude: 44.0128, longitude: 6.5292, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frmcl", text: "Montclar", latitude: 43.9905, longitude: 2.6096, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frmom", text: "Momuy", latitude: 43.6245, longitude: -0.6094, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frmtc", text: "Montancy", latitude: 47.3686, longitude: 7.019, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frnan", text: "Nancy", latitude: 48.7158, longitude: 6.5816, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frnim", text: "Nîmes", latitude: 43.8061, longitude: 4.5027, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frniz", text: "Saint Nizier", latitude: 46.0678, longitude: 4.4453, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "fropo", text: "Opoul", latitude: 42.9184, longitude: 2.865, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frpla", text: "Plabennec", latitude: 48.4609, longitude: -4.4298, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frtou", text: "Toulouse", latitude: 43.5743, longitude: 1.3763, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frtra", text: "Trappes", latitude: 48.7746, longitude: 2.0083, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "frtre", text: "Treillères", latitude: 47.3374, longitude: -1.6563, timezone: "Europe/Paris", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" }
      ]
    },
    {
      label: "Germany",
      options: [
        { odimCode: "deboo", text: "Boostedt", latitude: 54.0043, longitude: 10.0468, timezone: "Europe/Berlin", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "dedrs", text: "Dresden", latitude: 51.1246, longitude: 13.7686, timezone: "Europe/Berlin", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "deeis", text: "Eisberg", latitude: 49.5414, longitude: 12.4044, timezone: "Europe/Berlin", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "deemd", text: "Emden", latitude: 53.3387, longitude: 7.0237, timezone: "Europe/Berlin", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "deess", text: "Essen", latitude: 51.4055, longitude: 6.9669, timezone: "Europe/Berlin", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "defbg", text: "Feldberg", latitude: 47.8736, longitude: 8.0039, timezone: "Europe/Berlin", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "defld", text: "Flechtdorf", latitude: 51.3119, longitude: 8.8033, timezone: "Europe/Berlin", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "dehnr", text: "Hannover", latitude: 52.46, longitude: 9.6945, timezone: "Europe/Berlin", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "deisn", text: "Isen/München", latitude: 48.1747, longitude: 12.1017, timezone: "Europe/Berlin", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "deasb", text: "Isle of Borkum", latitude: 53.564, longitude: 6.7482, timezone: "Europe/Berlin", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "demem", text: "Memmingen", latitude: 48.0421, longitude: 10.2192, timezone: "Europe/Berlin", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "deneu", text: "Neuhaus", latitude: 50.5001, longitude: 11.1351, timezone: "Europe/Berlin", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "denhb", text: "Neuheilenbach", latitude: 50.1097, longitude: 6.5483, timezone: "Europe/Berlin", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "deoft", text: "Offenthal", latitude: 49.9847, longitude: 8.7129, timezone: "Europe/Berlin", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "depro", text: "Protzel/Berlin", latitude: 52.6486, longitude: 13.858, timezone: "Europe/Berlin", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "deros", text: "Rostock", latitude: 54.1757, longitude: 12.058, timezone: "Europe/Berlin", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "detur", text: "Tuerkheim", latitude: 48.5853, longitude: 9.7828, timezone: "Europe/Berlin", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "deumd", text: "Ummendorf", latitude: 52.1601, longitude: 11.1761, timezone: "Europe/Berlin", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" }
      ]
    },
    {
      label: "Israel",
      options: [
        { odimCode: "iltlv", text: "Bet Dagan", latitude: 32.007, longitude: 34.8146, timezone: "Asia/Jerusalem", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" }
      ]
    },
    {
      label: "Netherlands",
      options: [
        { odimCode: "nldbl", text: "De Bilt", latitude: 52.1017, longitude: 5.1783, timezone: "Europe/Amsterdam", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "nldhl", text: "Den Helder", latitude: 52.9533, longitude: 4.7899, timezone: "Europe/Amsterdam", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "nlhrw", text: "Herwijnen", latitude: 51.8371, longitude: 5.138, timezone: "Europe/Amsterdam", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" }
      ]
    },
    {
      label: "Norway",
      options: [
        { odimCode: "noand", text: "Andoya", latitude: 69.2414, longitude: 16.0028, timezone: "Europe/Oslo", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "nober", text: "Berlevaag", latitude: 70.5107, longitude: 29.0184, timezone: "Europe/Oslo", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "nobml", text: "Boemlo", latitude: 59.854, longitude: 5.09, timezone: "Europe/Oslo", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "nohas", text: "Hasvik", latitude: 70.6052, longitude: 22.443, timezone: "Europe/Oslo", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "nohgb", text: "Haegebostad", latitude: 58.3601, longitude: 7.1648, timezone: "Europe/Oslo", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "nohur", text: "Hurum", latitude: 59.6272, longitude: 10.5645, timezone: "Europe/Oslo", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "norsa", text: "Rissa", latitude: 63.6905, longitude: 10.2037, timezone: "Europe/Oslo", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "norst", text: "Rost", latitude: 67.5307, longitude: 12.0986, timezone: "Europe/Oslo", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "nosmn", text: "Soemna", latitude: 65.2201, longitude: 11.9926, timezone: "Europe/Oslo", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "nosta", text: "Stad", latitude: 62.1871, longitude: 5.1275, timezone: "Europe/Oslo", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" }
      ]
    },
    {
      label: "Poland",
      options: [
        { odimCode: "plbrz", text: "Brzuchania", latitude: 50.3942, longitude: 20.0797, timezone: "Europe/Warsaw", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "plgda", text: "Gdańsk", latitude: 54.3843, longitude: 18.4563, timezone: "Europe/Warsaw", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "plleg", text: "Legionowo", latitude: 52.4053, longitude: 20.9611, timezone: "Europe/Warsaw", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "plpas", text: "Pastewnik", latitude: 50.892, longitude: 16.0395, timezone: "Europe/Warsaw", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "plpoz", text: "Poznań", latitude: 52.4133, longitude: 16.7971, timezone: "Europe/Warsaw", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "plram", text: "Ramża", latitude: 50.1517, longitude: 18.7267, timezone: "Europe/Warsaw", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "plrze", text: "Rzeszów", latitude: 50.1138, longitude: 22.0367, timezone: "Europe/Warsaw", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "plswi", text: "Świdwin", latitude: 53.7903, longitude: 15.8311, timezone: "Europe/Warsaw", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
      ]
    },
    {
      label: "Portugal",
      options: [
        { odimCode: "ptprt", text: "Arouca/Pico do Gralheiro", latitude: 40.845, longitude: -8.2797, timezone: "Europe/Lisbon", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "ptlis", text: "Coruche/Cruz do Leão", latitude: 39.0714, longitude: -8.3989, timezone: "Europe/Lisbon", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "ptfar", text: "Loule/Cavalos do Caldeirão", latitude: 37.3053, longitude: -7.9517, timezone: "Europe/Lisbon", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" }
      ]
    },
    {
      label: "Slovak Republic",
      options: [
        { odimCode: "skkoj", text: "Kojsovska hola", latitude: 48.7829, longitude: 20.9873, timezone: "Europe/Bratislava", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "skkub", text: "Kubinska hola", latitude: 49.2717, longitude: 19.2494, timezone: "Europe/Bratislava", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "skjav", text: "Maly Javornik", latitude: 48.2561, longitude: 17.1531, timezone: "Europe/Bratislava", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "sklaz", text: "Spani laz", latitude: 48.2404, longitude: 19.2574, timezone: "Europe/Bratislava", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" }
      ]
    },
    {
      label: "Slovenia",
      options: [
        { odimCode: "silis", text: "Lisca", latitude: 46.068, longitude: 15.285, timezone: "Europe/Ljubljana", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "sipas", text: "Pasja ravan", latitude: 46.098, longitude: 14.2283, timezone: "Europe/Ljubljana", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" }
      ]
    },
    {
      label: "Spain",
      options: [
        { odimCode: "essan", text: "Aguión (Asturias)", latitude: 43.4625, longitude: -6.3019, timezone: "Europe/Madrid", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "esmal", text: "Alhaurin el Grande (Malaga)", latitude: 36.6133, longitude: -4.6592, timezone: "Europe/Madrid", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "eslpa", text: "Artenara (Gran Canaria)", latitude: 28.0186, longitude: -15.6144, timezone: "Europe/Madrid", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "eslid", text: "Autilla Pino (Palencia)", latitude: 41.9956, longitude: -4.6028, timezone: "Europe/Madrid", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "essse", text: "Baquio (Vizcaya)", latitude: 43.4033, longitude: -2.8419, timezone: "Europe/Madrid", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "essev", text: "Castillo las Guardas (Sevilla)", latitude: 37.6875, longitude: -6.3344, timezone: "Europe/Madrid", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "escor", text: "Cerceda ( La Coruna)", latitude: 43.1689, longitude: -8.5269, timezone: "Europe/Madrid", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "esbar", text: "Corbera (Barcelona)", latitude: 41.4081, longitude: 1.8847, timezone: "Europe/Madrid", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "esval", text: "Cullera (Valencia)", latitude: 39.1761, longitude: -0.2521, timezone: "Europe/Madrid", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "esmur", text: "Fortuna (Murcia)", latitude: 38.2644, longitude: -1.1897, timezone: "Europe/Madrid", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "espma", text: "Llucmajor (Baleares)", latitude: 39.3797, longitude: 2.785, timezone: "Europe/Madrid", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "esalm", text: "Nijar (Almeria)", latitude: 36.8325, longitude: -2.0822, timezone: "Europe/Madrid", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "eszar", text: "Perdiguera (Zaragoza)", latitude: 41.7339, longitude: -0.5458, timezone: "Europe/Madrid", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "esbad", text: "Sierra de Fuentes (Caceres)", latitude: 39.4289, longitude: -6.2853, timezone: "Europe/Madrid", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "esmad", text: "Torrejon de Velasco (Madrid)", latitude: 40.1758, longitude: -3.7136, timezone: "Europe/Madrid", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" }
      ]
    },
    {
      label: "Sweden",
      options: [
        { odimCode: "seang", text: "Ängelholm", latitude: 56.3675, longitude: 12.8517, timezone: "Europe/Stockholm", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "seatv", text: "Åtvidaberg (Vilebo)", latitude: 58.1059, longitude: 15.9363, timezone: "Europe/Stockholm", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "sebaa", text: "Bålsta", latitude: 59.611, longitude: 17.5833, timezone: "Europe/Stockholm", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "sehem", text: "Hemse (Ase)", latitude: 57.3035, longitude: 18.4001, timezone: "Europe/Stockholm", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "sehuv", text: "Hudiksvall", latitude: 61.5771, longitude: 16.7144, timezone: "Europe/Stockholm", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "sekaa", text: "Karlskrona", latitude: 56.2955, longitude: 15.6102, timezone: "Europe/Stockholm", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "sekrn", text: "Kiruna", latitude: 67.7088, longitude: 20.6178, timezone: "Europe/Stockholm", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "selek", text: "Leksand", latitude: 60.723, longitude: 14.8776, timezone: "Europe/Stockholm", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "sella", text: "Luleå (Rosvik)", latitude: 65.4309, longitude: 21.865, timezone: "Europe/Stockholm", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "seoer", text: "Örnsköldsvik", latitude: 63.6395, longitude: 18.4019, timezone: "Europe/Stockholm", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "seosd", text: "Östersund", latitude: 63.2951, longitude: 14.7591, timezone: "Europe/Stockholm", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "sevax", text: "Vara", latitude: 58.2556, longitude: 12.826, timezone: "Europe/Stockholm", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" }
      ]
    },
    {
      label: "Switzerland",
      options: [
        { odimCode: "chalb", text: "Albis", latitude: 47.2843, longitude: 8.512, timezone: "Europe/Zurich", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "chdol", text: "La Dole", latitude: 46.4251, longitude: 6.0994, timezone: "Europe/Zurich", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "chlem", text: "Monte Lema", latitude: 46.0408, longitude: 8.8332, timezone: "Europe/Zurich", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "chppm", text: "Plaine Monte", latitude: 46.3706, longitude: 7.4866, timezone: "Europe/Zurich", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV" },
        { odimCode: "chwei", text: "Weissfluhgiptel", latitude: 46.835, longitude: 9.7945, timezone: "Europe/Zurich", endpoint: aloftBaltradUrl, heights: availableHeights, vptsFileFormat: "CSV"}
      ]
    }
  ] as GroupedRadarInterface[],

  initialRadarCode: "bejab",

  availableTimeIntervals: [
    { stringId: "1d", value: 24 },
    { stringId: "3d", value: 72 },
    //{ text: "1h", value: 1 } // Only for debugging: intervals that are not multiple of 24h won't work properly with the time navigation logic
  ] as TimeInterval[],

  initialTimeInterval: 24,
  initialDate: moment().subtract(1, "days").format(moment.HTML5_FMT.DATE),

  initialTimeDisplay: "radarLocal" as TimeDisplayedAsValue,

  appTemporalResolution: 15 * 60, // seconds (this is the resolution we use for calculation and display) Should be a multiple of the data (vpts file) temporal resolution for downsampling, or equal if we want to show data at the highest resolution

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
