"use strict";

import { fetchVpts, readVpts } from "./modules/fetchVpts.js";
import { integrateProfile } from "./modules/integrateProfile.js";
import { plotVpts } from "./modules/plotVpts.js";
import { plotVpi } from "./modules/plotVpi.js";

function calculateMtr(data, altMin = 0, altMax = Infinity,
    interval = 200, vvpThresh = 2, alpha = NaN) {
    // Note: interval and vvpThresh should actually be derived from data/metadata itself

    // extract the data - could be improved by using data itself as input
    //let date = data.key;
    //data = data.values;

    // check the input arguments
    if (!(typeof altMin == 'number') || !(typeof altMax == 'number' || altMax == Infinity)) {
        throw "Altitudes need to be nunmeric";
    }
    if (!(isNaN(alpha) || !(typeof alpha == 'number'))) {
        throw "Alpha need to be numeric or Nan";
    }
    if (altMax <= altMin) {
        console.log("'altMin' should be smaller than 'altMax'");
    }

    // get height ranges
    let altMinData = data.map(x => x.height).reduce((a, b) => Math.min(a, b));
    let altMaxData = data.map(x => x.height).reduce((a, b) => Math.max(a, b));
    altMin = Math.max(altMin, altMinData);
    altMax = Math.min(altMax, altMaxData + interval);
    // console.log(altMin, altMax)

    // filter only the requested heights
    data = data.filter(d => d.height >= altMin & d.height <= altMax);
    // console.log(data);

    // filter only sd_vvp values above sd_vvp threshold
    data = data.filter(d => d.sd_vvp >= vvpThresh);
    if (data.length == 0) {
        return NaN
    }

    // extract the dd, ff and dens values
    let ff = data.map(x => x.ff);
    let dens = data.map(x => x.dens);

    // calculate the cosFactor
    let cosFactor = [];
    if (isNaN(alpha)) {
        cosFactor =  data.map(x => 1. + 0. * x.dd);
      } else {
        cosFactor = data.map(x => Math.cos(x.dd - alpha) * Math.PI / 180);
      }

    // calculate mtr
    let mtr = 0.001 * interval * cosFactor.map((e, i) => e * ff[i] * dens[i] * 3.6)
        .filter(x => !Number.isNaN(x))
        .reduce((a, b) => a + b, 0);

    return mtr
}

// Read example data file
const file = "./data/example_vpts_20160901.csv"
const dataset = readVpts(file);

// Initialize chart
const vpiChart = plotVpi().width(800).height(400);

//this promise returns our parsed data
// http://datawanderings.com/2018/08/15/d3-js-v5-promise-syntax-examples/
var csv_parsed = dataset.then(
    function(value) {
        return Promise.all(value.map(function(item){
            return {
                datetime: Date.parse(item.datetime), // cast to date
                height: parseInt(item.height), // cast to int
                dd: +item.dd,
                ff: +item.ff,
                dens: +item.dens,
                sd_vvp: +item.sd_vvp
            };
        }))
    });

//print the object
csv_parsed.then(function(data) {

    var data_nested = d3.nest()
        .key(function(d) { return d.datetime}) // group data by datetime
        .entries(data);

    let mtr_profile = data_nested.map(d => ({
            datetime : d.key,
            mtr : calculateMtr(d.values)
        })); // 400, 2000, 200, 3

    // Select element, bind data and call chart
    d3.select("#vpi-chart")
      .datum(mtr_profile)
      .call(vpiChart);
});
