// TODO: move field position (hardcoded constants) to config.js
import config from "./config";
import * as d3 from "d3"; // TODO: Remove D3 dependency from this file so only the "chart" modules need it
import moment from "moment-timezone";
import { Profiles, VTPSDataRowFromFile } from './CrowTypes';

import {rgb as colorRgb, RGBColor} from "d3-color";

function interpolateBioRad(val: number): RGBColor {
    // Num: between 0 and 1 
    
    
    //console.log("val reçu", val);
    val = val * 255; // Constants below are taken from bioRad and have a 0-255 range

    //console.log("val", val);

    // Reimplementation of the IDL color scale; based on bioRad's implementation (https://github.com/adokter/bioRad/blob/e0ede427eb34007dc9985302d40cbdab158e0636/R/color_scale.R#L65-L85)
    // and the explanations at: https://github.com/inbo/crow/issues/38 
    const redInflexionPoints = [  0,  62,  81,  93, 145, 176, 191, 208, 255];
    const redIntensities     = [255, 255, 163, 255, 255,  81, 81,    0,   0];

    const greenInflexionPoints = [  0,  64,  79, 110, 142, 255];
    const greenIntensities     = [255, 255, 163, 163,   0,   0];

    const blueInflexionPoints = [  0, 79, 96, 110, 127, 159, 206, 255]; 
    const blueIntensities     = [255,  0,  0,  82,   0,   0, 255,   0];

    const redPosition = d3.bisect(redInflexionPoints, val);
    //console.log("redPosition", redPosition);
    const redIntensity = (redIntensities[redPosition - 1] + redIntensities[redPosition]) / 2;
    //console.log("redIntensity", redIntensity);

    const greenPosition = d3.bisect(greenInflexionPoints, val);
    const greenIntensity = (greenIntensities[greenPosition - 1] + greenIntensities[greenPosition]) / 2;

    const bluePosition = d3.bisect(blueInflexionPoints, val);
    const blueIntensity = (blueIntensities[bluePosition - 1] + blueIntensities[bluePosition]) / 2;

    //return `rgb(${redIntensity}, ${greenIntensity}, ${blueIntensity})`
    return colorRgb(redIntensity, greenIntensity, blueIntensity, 1)

}

const bioRadScheme = ["#C8C8C8", "#FFFFFF", "#FFFFFB", "#FFFFF8", "#FFFFF5", "#FFFFF2",
    "#FFFFEE", "#FFFFEB", "#FFFFE8", "#FFFFE5", "#FFFFE1", "#FFFFDE",
    "#FFFFDB", "#FFFFD8", "#FFFFD4", "#FFFFD1", "#FFFFCE", "#FFFFCB",
    "#FFFFC7", "#FFFFC4", "#FFFFC1", "#FFFFBE", "#FFFFBA", "#FFFFB7",
    "#FFFFB4", "#FFFFB1", "#FFFFAD", "#FFFFAA", "#FFFFA7", "#FFFFA4",
    "#FFFFA1", "#FFFF9D", "#FFFF9A", "#FFFF97", "#FFFF94", "#FFFF90",
    "#FFFF8D", "#FFFF8A", "#FFFF87", "#FFFF83", "#FFFF80", "#FFFF7D",
    "#FFFF7A", "#FFFF76", "#FFFF73", "#FFFF70", "#FFFF6D", "#FFFF69",
    "#FFFF66", "#FFFF63", "#FFFF60", "#FFFF5C", "#FFFF59", "#FFFF56",
    "#FFFF53", "#FFFF50", "#FFFF4C", "#FFFF49", "#FFFF46", "#FFFF43",
    "#FFFF3F", "#FFFF3C", "#FFFF39", "#FDFF36", "#F8FF32", "#F4FD2F",
    "#EFF72C", "#EAF129", "#E5EA25", "#E0E422", "#DBDE1F", "#D6D81C",
    "#D2D218", "#CDCC15", "#C8C612", "#C3BF0F", "#BEB90B", "#B9B308",
    "#B4AD05", "#B0A702", "#ABA300", "#A6A300", "#A5A300", "#ADA300",
    "#B4A300", "#BCA300", "#C4A300", "#CBA300", "#D3A300", "#DBA300",
    "#E3A300", "#EAA300", "#F2A300", "#FAA300", "#FFA300", "#FFA300",
    "#FFA300", "#FFA302", "#FFA308", "#FFA30D", "#FFA313", "#FFA319",
    "#FFA31F", "#FFA325", "#FFA32B", "#FFA331", "#FFA337", "#FFA33D",
    "#FFA342", "#FFA348", "#FFA34E", "#FFA04F", "#FF9B4B", "#FF9646",
    "#FF9141", "#FF8C3C", "#FF8737", "#FF8232", "#FF7C2E", "#FF7729",
    "#FF7224", "#FF6D1F", "#FF681A", "#FF6315", "#FF5E10", "#FF590C",
    "#FF5407", "#FF4E02", "#FF4900", "#FF4400", "#FF3F00", "#FF3A00",
    "#FF3500", "#FF3000", "#FF2B00", "#FF2600", "#FF2000", "#FF1B00",
    "#FF1600", "#FF1100", "#FF0C00", "#FF0700", "#FF0200", "#FF0000",
    "#FF0000", "#FF0000", "#FB0000", "#F60000", "#F00000", "#EA0000",
    "#E50000", "#DF0000", "#D90000", "#D40000", "#CE0000", "#C90000",
    "#C30000", "#BD0000", "#B80000", "#B20000", "#AC0003", "#A70008",
    "#A1000E", "#9C0013", "#960019", "#90001E", "#8B0024", "#850029",
    "#7F002E", "#7A0034", "#740039", "#6E003F", "#690044", "#63004A",
    "#5E004F", "#580055", "#52005A", "#51005F", "#510065", "#51006A",
    "#510070", "#510075", "#51007B", "#510080", "#510086", "#51008B",
    "#510091", "#510096", "#51009B", "#5100A1", "#5100A6", "#5100AC",
    "#4D00B1", "#4800B7", "#4300BC", "#3F00C2", "#3A00C7", "#3500CC",
    "#3000D2", "#2B00D7", "#2700DD", "#2200E2", "#1D00E8", "#1800ED",
    "#1400F3", "#0F00F8", "#0A00FD", "#0500FA", "#0000F5", "#0000F0",
    "#0000EB", "#0000E5", "#0000E0", "#0000DB", "#0000D6", "#0000D0",
    "#0000CB", "#0000C6", "#0000C1", "#0000BC", "#0000B6", "#0000B1",
    "#0000AC", "#0000A7", "#0000A1", "#00009C", "#000097", "#000092",
    "#00008D", "#000087", "#000082", "#00007D", "#000078", "#000072",
    "#00006D", "#000068", "#000063", "#00005E", "#000058", "#000053",
    "#00004E", "#000049", "#000043", "#00003E", "#000039", "#000034",
    "#00002F", "#000029", "#000024", "#00001F", "#00001A", "#000014",
    "#00000F", "#00000A", "#000005", "#000000"]

function densityToBirdtam(density: number): number {
    // Takes a density (from VTPS data) and turn it to a BIRDTAM code.
    // Implementation based on the following explanation from Hans van Gasteren (Dutch Air Force)
    /* 
    RGB codes van 0-4 in licht groen. BIRDTAM 5 is 100% groen en daarna 6 en hoger. Ik heb ook BIRDTAM 9 geintroduceerd om de extremen (en regen) weer te geven. Zo staan ze althans op dit moment op de FlySafe-pagina en in ons artikel

    BIRDTAM RGB-kleuren = [1 1 1; .9 1 .9; .8 1 .8; .7 1 .7; .6 1 .6; 0 1 0; 1 1 0; 1 .7 .7; 1 0 0; .2 .2 .2;];

    *Vanuit dichtheid (#/km^3) naar BIRDTAM: densitybirdtam = 1.4427.log(density+1)+1.6781
    En dan de getallen naar beneden afronden om de juiste BIRDTAM te vinden: floor(densitybirdtam), (birdtam 5,6 wordt dus een 5!)

    Overigens voor de vertical integrated densities (VID) gebruik ik dezelfde conversie. density == VID
    */
    return Math.floor(1.4427 * Math.log(density + 1) + 1.6781);
}

function uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
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
        if (c == 32) return '-';
        if (c >= 65 && c <= 90) return '_' + s.toLowerCase();
        return '__' + ('000' + c.toString(16)).slice(-4);
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
    if (!(typeof altMin == 'number') || !(typeof altMax == 'number' || altMax == Infinity)) {
        throw "'altMin'/'altMax' need to be nunmeric";
    }
    if (!(isNaN(alpha) || !(typeof alpha == 'number'))) {
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

export default { parseVtps, integrateProfile, metersToFeet, makeSafeForCSS, formatTimestamp, formatMoment, uuidv4, densityToBirdtam, bioRadScheme, interpolateBioRad } 