// TODO: move field position (hardcoded constants) to config.js
import config from "./config";
import * as d3 from "d3"; // TODO: Remove D3 dependency from this file so only the "chart" modules need it
import moment from "moment-timezone";
import { LangCode, MultilanguageStringContainer, Profiles, VTPSDataRowFromFile } from "./CrowTypes";

import { rgb as colorRgb, RGBColor } from "d3-color";

function getIntensity(val: number, inflexionPoints: number[], intensities: number[]) {
  const i = inflexionPoints.findIndex(e => e === val)

  if (i === -1) {
    // Not found, we interpolate
    const position = d3.bisect(inflexionPoints, val);
    
    let scale = d3.scaleLinear()
                .domain([inflexionPoints[position - 1], inflexionPoints[position]])
                .range([intensities[position - 1], intensities[position]])
    
    return scale(val);

  } else {
    return intensities[i];
  }
}

function interpolateBioRad(val: number): RGBColor {
  // Num: between 0 and 1 
  val = val * 255; // Constants below are taken from bioRad and have a 0-255 range

  // Reimplementation of the IDL color scale; based on bioRad's implementation (https://github.com/adokter/bioRad/blob/e0ede427eb34007dc9985302d40cbdab158e0636/R/color_scale.R#L65-L85)
  // and the explanations at: https://github.com/inbo/crow/issues/38 
  const redIntensity = getIntensity(val, [0, 62, 81, 93, 145, 176, 191, 208, 255], [255, 255, 163, 255, 255, 81, 81, 0, 0])
  const greenIntensity = getIntensity(val, [0, 64, 79, 110, 142, 255], [255, 255, 163, 163, 0, 0]);
  const blueIntensity = getIntensity(val, [0, 79, 96, 110, 127, 159, 206, 255], [255, 0, 0, 82, 0, 0, 255, 0]);

  return colorRgb(redIntensity, greenIntensity, blueIntensity, 1)
}

function densityToBirdtam(density: number): number {
  // Takes a density (from VTPS data) and turn it to a BIRDTAM code.
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

function parseVtps(responseString: string): VTPSDataRowFromFile[] {
  let d = responseString.split("\n");
  d = d.splice(config.vtpsFormat.numHeaderLines); // Remove 4 header lines
  // The file is also terminated by a blank line, which cause issues.
  d.pop()

  const r = d.map(function (row) {
    // There are NaN values everywhere in the data, D3 don't know how to interpret them
    // For now, we consider a non-numbers to mean 0

    return {
      datetime: moment.utc(row.substring(0, 13), "YYYYMMDD HHmm").valueOf(),
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

function integrateProfile(data: VTPSDataRowFromFile[], altMin = 0, altMax = Infinity, interval = 200, vvpThresh = 2, alpha = NaN): Profiles {
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
  data = data.filter(d => d.sd_vvp >= vvpThresh);
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

export default { parseVtps, integrateProfile, metersToFeet, makeSafeForCSS, formatTimestamp, formatMoment, uuidv4, densityToBirdtam, interpolateBioRad, translateString }
