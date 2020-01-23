// TODO: move field position (hardcoded constants) to config.js
import config from "./config";
import * as d3 from "d3"; // TODO: Remove D3 dependency from this file so only the "chart" modules need it
import moment from "moment-timezone";

function UTCTimestampToLocal(UTCTimestamp, zone) {
    return UTCTimestamp - moment.tz.zone(zone).utcOffset(UTCTimestamp) * 60 * 1000;
}

function adjustTimestamps(arr, showTimeAs) {
    // param arr: Array of objects (each has a 'timestamp' property, in UTC)
    // param showTimeAs: either a timezone designator such as 'Europe/Brussels' or 'UTC'

    // This function returns an array of objects with timestamps adjusted for the timezone (if necessary)
    if (showTimeAs === "UTC") {
        return arr;
    } else {
        let adjustedData = [];

        for (const originalRow of arr) {
            const updatedRow = {
                ...originalRow,
                // We add the necessary offset
                timestamp: UTCTimestampToLocal(originalRow.timestamp, showTimeAs)
            };

            adjustedData.push(updatedRow);
        }

        return adjustedData;
    }
}

function metersToFeet(meters) {
    return meters * 3, 281;
}

function parseFloatOrZero(string) {
    let val = parseFloat(string);
    if (isNaN(val)) {
        return 0;
    } else {
        return val;
    }
}

function readVtps(responseString) {
    let d = responseString.split("\n");
    d = d.splice(config.vtpsFormat.numHeaderLines); // Remove 4 header lines
    // The file is also terminated by a blank line, which cause issues.
    d.pop()

    d = d.map(function (row) {
        // There are NaN values everywhere in the data, D3 don't know how to interpret them
        // For now, we consider a non-numbers to mean 0

        return {
            datetime: Date.parse(
                row.substring(0, 4) +
                "-" +
                row.substring(4, 6) +
                "-" +
                row.substring(6, 8) +
                "T" +
                row.substring(9, 11) +
                ":" +
                row.substring(11, 13)
            ),
            height: +parseInt(row.substring(14, 18)),
            dd: parseFloat(row.substring(47, 52)),
            ff: parseFloat(row.substring(41, 46)),
            dens: parseFloatOrZero(row.substring(76, 82)),
            sd_vvp: parseFloat(row.substring(53, 59))
        };
    });

    return d;
}

function integrateProfile(data, altMin = 0, altMax = Infinity, interval = 200, vvpThresh = 2, alpha = NaN) {
    // TODO: interval and vvpThresh should actually be derived from data/metadata itself
    // TODO: extract the data - could be improved by using data itself as input
    // TODO: return other properties than mtr

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

    // Get height ranges
    const altMinMaxFromData = d3.extent(data, d => d.height);
    altMin = Math.max(altMin, altMinMaxFromData[0]);
    altMax = Math.min(altMax, altMinMaxFromData[1] + interval); // Interval added to get upper bound of height layer

    // Filter data on requested heights
    data = data.filter(d => d.height >= altMin & d.height <= altMax);

    // Filter data on sd_vvp values above sd_vvp threshold
    data = data.filter(d => d.sd_vvp >= vvpThresh);
    if (data.length == 0) {
        return NaN;
    }

    // Extract dd, ff and dens values
    let ff = data.map(x => x.ff);
    let dens = data.map(x => x.dens);

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

    return mtr
}

export default { readVtps, integrateProfile, metersToFeet, adjustTimestamps, UTCTimestampToLocal } 