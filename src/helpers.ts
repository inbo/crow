// TODO: move field position (hardcoded constants) to config.js
import config from "./config";
import * as d3 from "d3"; // TODO: Remove D3 dependency from this file so only the "chart" modules need it
import moment from "moment-timezone";
import { VTPSDataRowFromFile } from "./VTPSDataRowFromFileInterface";
import { Profiles } from './ProfilesInterface';

function uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

function formatMoment(moment: moment.Moment, showTimeAs:string, timeAxisFormat:string): string {
    // Format the timestamp passed as argument, according to timezone and timeAxisFormat
    return moment.tz(showTimeAs).format(timeAxisFormat);
}

function formatTimestamp(ts:number, showTimeAs:string, timeAxisFormat:string): string {
    // Format the timestamp passed as argument, according to timezone and timeAxisFormat
    return formatMoment(moment(ts), showTimeAs, timeAxisFormat);
}

function makeSafeForCSS(name: string): string {
    return name.replace(/[^a-z0-9]/g, function(s) {
        var c = s.charCodeAt(0);
        if (c == 32) return '-';
        if (c >= 65 && c <= 90) return '_' + s.toLowerCase();
        return '__' + ('000' + c.toString(16)).slice(-4);
    });
}

function metersToFeet(meters: number): number {
    return meters * 3.281;
}

function parseFloatOrZero(str: string): number {
    let val = parseFloat(str);
    if (isNaN(val)) {
        return 0;
    } else {
        return val;
    }
}

function readVtps(responseString: string): VTPSDataRowFromFile[] {
    let d = responseString.split("\n");
    d = d.splice(config.vtpsFormat.numHeaderLines); // Remove 4 header lines
    // The file is also terminated by a blank line, which cause issues.
    d.pop()

    let r = d.map(function (row) {
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
    let ff = data.map(x => x.ff);
    let dens = data.map(x => x.dens);
    let eta = data.map(x => x.eta);

    // Calculate the cosFactor
    let cosFactor = [];
    if (isNaN(alpha)) {
        cosFactor = data.map(x => 1. + 0. * x.dd);
    } else {
        cosFactor = data.map(x => Math.cos(x.dd - alpha) * Math.PI / 180);
    }

    // Calculate mtr
    let mtr = 0.001 * interval * cosFactor.map((e, i) => e * ff[i] * dens[i] * 3.6)
        .filter(x => !Number.isNaN(x))
        .reduce((a, b) => a + b, 0);

    // Calculate rtr
    let rtr = 0.001 * interval * cosFactor.map((e, i) => e * ff[i] * eta[i] * 3.6)
        .filter(x => !Number.isNaN(x))
        .reduce((a, b) => a + b, 0);

    // Calculate vid
    let vid = 0.001 * interval * dens
        .filter(x => !Number.isNaN(x))
        .reduce((a, b) => a + b, 0);

    // Calculate vir
    let vir = 0.001 * interval * eta
        .filter(x => !Number.isNaN(x))
        .reduce((a, b) => a + b, 0);

    return ({ "mtr": mtr, "rtr": rtr, "vid": vid, "vir": vir })
}

export default { readVtps, integrateProfile, metersToFeet, makeSafeForCSS, formatTimestamp, formatMoment, uuidv4 } 