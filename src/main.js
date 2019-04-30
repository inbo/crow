"use strict";

import { fetchVpts, readVpts } from "./modules/fetchVpts.js";
import { integrateProfile } from "./modules/integrateProfile.js";
import { plotVpts } from "./modules/plotVpts.js";
import { plotVpi } from "./modules/plotVpi.js";

// Read example data file
const file = "./data/example_vpts_20160901.csv";
const dataset = readVpts(file);

//this promise returns our parsed data
// http://datawanderings.com/2018/08/15/d3-js-v5-promise-syntax-examples/
var csv_parsed = dataset.then(function(value) {
  return Promise.all(value.map(function(item){
    return {
      datetime: Date.parse(item.datetime), // cast to date
      height: parseInt(item.height), // cast to int
      dd: +item.dd,
      ff: +item.ff,
      dens: +item.dens,
      sd_vvp: +item.sd_vvp,
      eta: +item.eta
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
    mtr : integrateProfile(d.values)
  })); // 400, 2000, 200, 3

  // Create vpiChart
  let vpiChart = plotVpi().width(500).height(250);
  vpiChart.data(mtr_profile);

  d3.select("#vpi-chart")
    .call(vpiChart);
});

// Test transition with simple data

let mtr_profile_1 = [
  {datetime: "1472688120000", mtr: 18.863869090909088},
  {datetime: "1472688360000", mtr: 11.83562181818182},
  {datetime: "1472688600000", mtr: 10.101730909090909},
  {datetime: "1472688840000", mtr: 19.880378181818184},
  {datetime: "1472689080000", mtr: 25.690320000000003},
  {datetime: "1472689320000", mtr: 29.694894545454545},
  {datetime: "1472689560000", mtr: 46.80929454545455},
  {datetime: "1472689800000", mtr: 61.5505090909091},
  {datetime: "1472690040000", mtr: 77.11579636363638},
  {datetime: "1472690280000", mtr: 95.03306181818184}
];

let mtr_profile_2 = [
  {datetime: "1472701200000", mtr: 96.35976},
  {datetime: "1472701500000", mtr: 321.88480727272727},
  {datetime: "1472701800000", mtr: 121.49941090909093},
  {datetime: "1472702160000", mtr: 51.229832727272736},
  {datetime: "1472702460000", mtr: 49.14608727272728},
  {datetime: "1472702760000", mtr: 40.58227636363637},
  {datetime: "1472703060000", mtr: 33.03693818181818},
  {datetime: "1472703360000", mtr: 50.2155490909091},
  {datetime: "1472703660000", mtr: 24.220538181818185},
  {datetime: "1472703960000", mtr: 54.07703999999998}
]

let myChart = plotVpi();
myChart.data(mtr_profile_1);
d3.select("#my-chart")
  .call(myChart);

setTimeout(function(){
  myChart.data(mtr_profile_2);
}, 1000);
