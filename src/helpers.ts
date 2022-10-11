// TODO: move field position (hardcoded constants) to config.js
import * as d3 from "d3";
import moment from "moment-timezone";
import { LangCode, MultilanguageStringContainer, Profiles, RadarInterface, VPTSDataRowFromFile, VPTSFileFormat } from "./CrowTypes";

import { rgb, RGBColor } from "d3-color";

const SD_VVP_THRESHOLD = 2; // VPTS data with sd_vvp < sdVpp_treshold are considered NOT birds (insects or rain)

function interpolateStdGammaII(val: number): RGBColor {
  // Num: between 0 and 1
  val = 255 - (val * 255); // Constants below are taken from bioRad and have a 0-255 range

  // Reimplementation of the IDL "STD Gamma II" color scale; based on bioRad's implementation (https://github.com/adokter/bioRad/blob/e0ede427eb34007dc9985302d40cbdab158e0636/R/color_scale.R#L65-L85)
  // and the explanations at: https://github.com/inbo/crow/issues/38

  return rgb(
    d3.scaleLinear().domain([0, 62, 81, 93, 145, 176, 191, 208, 255]).range([255, 255, 163, 255, 255, 81, 81, 0, 0])(val),
    d3.scaleLinear().domain([0, 64, 79, 110, 142, 255]).range([255, 255, 163, 163, 0, 0])(val),
    d3.scaleLinear().domain([0, 79, 96, 110, 127, 159, 206, 255]).range([255, 0, 0, 82, 0, 0, 255, 0])(val),
    1
  )
}

function densityToBirdtam(density: number): number {
  // Takes a density (from VPTS data) and turn it to a BIRDTAM code.
  // Implementation based on the following explanation from Hans van Gasteren (Dutch Air Force)
  /*
  RGB codes van 0-4 in licht groen. BIRDTAM 5 is 100% groen en daarna 6 en hoger. Ik heb ook BIRDTAM 9 geintroduceerd om de extremen (en regen) weer te geven. Zo staan ze althans op dit moment op de FlySafe-pagina en in ons artikel

  BIRDTAM RGB-kleuren = [1 1 1; .9 1 .9; .8 1 .8; .7 1 .7; .6 1 .6; 0 1 0; 1 1 0; 1 .7 .7; 1 0 0; .2 .2 .2;];

  *Vanuit dichtheid (#/km^3) naar BIRDTAM: densitybirdtam = 1.4427.log(density+1)+1.6781
  En dan de getallen naar beneden afronden om de juiste BIRDTAM te vinden: floor(densitybirdtam), (birdtam 5,6 wordt dus een 5!)

  Overigens voor de vertical integrated densities (VID) gebruik ik dezelfde conversie. density == VID

  More discussions at https://github.com/inbo/crow/issues/76
  */
  return (density === 0 ? 0 : Math.floor(1.4427 * Math.log(density + 1) + 1.6781));
}

function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function formatMoment(moment: moment.Moment, showTimeAs: string, timeAxisFormat: string): string {
  // Format the timestamp passed as argument, according to timezone and timeAxisFormat
  return moment.tz(showTimeAs).format(timeAxisFormat);
}

function formatTimestamp(ts: number, showTimeAs: string, timeAxisFormat: string): string {
  // Format the timestamp passed as argument, according to timezone and timeAxisFormat
  return formatMoment(moment(ts), showTimeAs, timeAxisFormat);
}

function makeSafeForCSS(name: string): string {
  return name.replace(/[^a-z0-9]/g, function (s) {
    const c = s.charCodeAt(0);
    if (c == 32) return "-";
    if (c >= 65 && c <= 90) return "_" + s.toLowerCase();
    return "__" + ("000" + c.toString(16)).slice(-4);
  });
}

function metersToFeet(meters: number): number {
  return meters * 3.281;
}

function parseFloatOrZero(str: string): number {
  const val = parseFloat(str);
  if (isNaN(val)) {
    return 0;
  } else {
    return val;
  }
}

function filterVpts(rows: VPTSDataRowFromFile[], sd_vvpThresh = SD_VVP_THRESHOLD): VPTSDataRowFromFile[] {
  // Filter out data rows that are likely not birds, based on sd_vvp (https://github.com/inbo/crow/issues/122)
  return rows.filter(function (row) {
    return !isNaN(row.sd_vvp) && row.sd_vvp >= sd_vvpThresh
  })
}

interface csvDataRow { // An object whose key and values are both strings
  [fieldName: string]: string
}

function csvStringToObjs(csvString: string, lineSeparator='\n', fieldSeparator=',', quotedHeaders=true): csvDataRow[] {
  var arr = csvString.split(lineSeparator);
    var r = [];
    var headers = arr[0].split(fieldSeparator);

    if (quotedHeaders) {
      headers = headers.map(h => h.replace(/"/g,""))
    }

    for(var i = 1; i < arr.length; i++) {
      var data = arr[i].split(fieldSeparator);
      var obj = {} as csvDataRow;
      for(var j = 0; j < data.length; j++) {
         obj[headers[j].trim()] = data[j].trim();
      }
      r.push(obj);
    }

    return r
}

function parseCSVVpts(responseString: string): VPTSDataRowFromFile[] {
  // Data file sample: https://github.com/inbo/crow/issues/135#issuecomment-823844454
  const lineSeparator = '\n';
  const fieldSeparator = ',';
  const dateTimeFormat = 'YYYY-MM-DD hh:mm:ss';
  const quotedHeaders = true;
  const trailingLine = true;

  const d = csvStringToObjs(responseString, lineSeparator, fieldSeparator, quotedHeaders);

  if (trailingLine) {
    d.pop()
  }

  const r = d.map(function (row) {
    return {
      datetime: moment.utc(row.datetime, dateTimeFormat).valueOf(),
      height: parseInt(row.height),
      dd: parseFloat(row.dd),
      ff: parseFloat(row.ff),
      dens: parseFloatOrZero(row.dens),
      sd_vvp: parseFloat(row.sd_vvp),
      eta: parseFloatOrZero(row.eta)
    }
  });

  return r
}

/* Build the data URL for a given day and radar */
function buildVpTsDataUrl(radar: RadarInterface, selectedDate: moment.Moment): string {
  return radar.endpoint.replaceAll('{odimCode}', radar.odimCode)
                       .replaceAll('{yyyy}', selectedDate.format("YYYY"))
                       .replaceAll('{yyyymmdd}', selectedDate.format("YYYYMMDD"))
}

function roundNearest(num: number, resolution: number) {
  "Round to nearest integer value of the given resolution"
  return Math.floor(num / resolution) * resolution;
}


function parseVol2birdVpts(responseString: string): VPTSDataRowFromFile[] {
  const numHeaderLines = 4;

  let d = responseString.split("\n");
  d = d.splice(numHeaderLines); // Remove 4 header lines
  d.pop() // The file is also terminated by a blank line, which cause issues.

  const r = d.map(function (row) {
    // There are NaN values everywhere in the data, D3 don't know how to interpret them
    // For now, we consider a non-numbers to mean 0

    return {
      // assume 5 min is the absolute minimum resolution of the incoming data
      datetime: roundNearest(moment.utc(row.substring(0, 13), "YYYYMMDD HHmm").valueOf(), 5 * 60 * 1000),
      height: +parseInt(row.substring(14, 18)),
      dd: parseFloat(row.substring(47, 52)),
      ff: parseFloat(row.substring(41, 46)),
      dens: parseFloatOrZero(row.substring(76, 82)),
      sd_vvp: parseFloat(row.substring(53, 59)),
      eta: parseFloatOrZero(row.substring(70, 75))
    };
  });

  return r;
}

function parseVpts(responseString: string, format: VPTSFileFormat): VPTSDataRowFromFile[] {
  if (format === 'VOL2BIRD') {
    return parseVol2birdVpts(responseString);
  } else {
    return parseCSVVpts(responseString);
  }
}

function integrateProfile(data: VPTSDataRowFromFile[], altMin = 0, altMax = Infinity, interval = 200, sd_vvpThresh = SD_VVP_THRESHOLD, alpha = NaN): Profiles {
  // TODO: interval and vvpThresh should actually be derived from data/metadata itself
  // TODO: extract the data - could be improved by using data itself as input

  // Check input arguments
  if (!(typeof altMin == "number") || !(typeof altMax == "number" || altMax == Infinity)) {
    throw "'altMin'/'altMax' need to be nunmeric";
  }
  if (!(isNaN(alpha) || !(typeof alpha == "number"))) {
    throw "'alpha' needs to be numeric or Nan";
  }
  if (altMax <= altMin) {
    console.log("'altMin' should be smaller than 'altMax'");
  }

  // Filter data on requested heights
  // Get height ranges
  const altMinMaxFromData = d3.extent(data, d => d.height);
  if (altMinMaxFromData[0] == undefined || altMinMaxFromData[1] == undefined) {
    throw "Can not extract altMin/altMax from data"
  } else {
    altMin = Math.max(altMin, altMinMaxFromData[0]);
    altMax = Math.min(altMax, altMinMaxFromData[1] + interval); // Interval added to get upper bound of height layer
    data = data.filter(d => d.height >= altMin && d.height <= altMax);
  }

  // Filter data on sd_vvp values above sd_vvp threshold
  data = data.filter(d => d.sd_vvp >= sd_vvpThresh);
  if (data.length == 0) {
    return { "mtr": NaN, "rtr": NaN, "vid": NaN, "vir": NaN }
  }

  // Extract dd, ff and dens values
  const ff = data.map(x => x.ff);
  const dens = data.map(x => x.dens);
  const eta = data.map(x => x.eta);

  // Calculate the cosFactor
  let cosFactor = [];
  if (isNaN(alpha)) {
    cosFactor = data.map(x => 1. + 0. * x.dd);
  } else {
    cosFactor = data.map(x => Math.cos(x.dd - alpha) * Math.PI / 180);
  }

  // Calculate mtr
  const mtr = 0.001 * interval * cosFactor.map((e, i) => e * ff[i] * dens[i] * 3.6)
    .filter(x => !Number.isNaN(x))
    .reduce((a, b) => a + b, 0);

  // Calculate rtr
  const rtr = 0.001 * interval * cosFactor.map((e, i) => e * ff[i] * eta[i] * 3.6)
    .filter(x => !Number.isNaN(x))
    .reduce((a, b) => a + b, 0);

  // Calculate vid
  const vid = 0.001 * interval * dens
    .filter(x => !Number.isNaN(x))
    .reduce((a, b) => a + b, 0);

  // Calculate vir
  const vir = 0.001 * interval * eta
    .filter(x => !Number.isNaN(x))
    .reduce((a, b) => a + b, 0);

  return ({ "mtr": mtr, "rtr": rtr, "vid": vid, "vir": vir })
}

function translateString(stringId: string, selectedLanguageCode: LangCode, translations: MultilanguageStringContainer): string {
  if (translations.hasOwnProperty(stringId) && translations[stringId].hasOwnProperty(selectedLanguageCode) && translations[stringId][selectedLanguageCode] !== null) {
    return translations[stringId][selectedLanguageCode];
  } else {
    return stringId;
  }
}

function getBrowserFirstLangCode(): string | undefined {
  let lang = window.navigator.languages ? window.navigator.languages[0] : null;
  // @ts-ignore
  lang = lang || window.navigator.language || window.navigator.browserLanguage || window.navigator['userLanguage'];

  let shortLang = lang;
  if (shortLang !== null) {
    if (shortLang.indexOf('-') !== -1)
      shortLang = shortLang.split('-')[0];

    if (shortLang.indexOf('_') !== -1)
      shortLang = shortLang.split('_')[0];

    return shortLang;
  }

}


export default { parseVpts, integrateProfile, metersToFeet, makeSafeForCSS, formatTimestamp, formatMoment, uuidv4, densityToBirdtam, interpolateStdGammaII, translateString, filterVpts, getBrowserFirstLangCode, buildVpTsDataUrl }
