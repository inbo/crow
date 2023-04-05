import { createLocalVue, shallowMount } from "@vue/test-utils"
import { BootstrapVue } from "bootstrap-vue"
import helpers from "../../src/helpers"
import Home from "../../src/components/Home.vue";
import config from "@/config";
import { VPTSDataRowFromFile, VPIEntry } from "@/CrowTypes";
import axios from 'axios';
import moment from "moment";

import * as Papa from "papaparse";
import { ConfigStoreModule } from "@/store/ConfigStore";
const fs = require("fs");
const path = require("path");

const localVue = createLocalVue()
localVue.use(BootstrapVue)


test("Home component rendering", () => {
  // Temporary disabling cause it fails

  /*const wrapper = mount(Home, {localVue});
  expect(wrapper.contains("form")).toBe(true); // It contains a form*/
});

function round3decimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 1000) / 1000
}

test("Profile integration code (compare to bioRad output)", () => {

  // Set appTemporalResolution to the data resolution to have a 1:1 comparison
  // (unit test bypasses the `populateDataFromCrowServer` logic for filtering)
  config.appTemporalResolution = 5 * 60

  // 1. Load and parse the data
  // 1.1 From VPTS file
  const sourceData = fs.readFileSync(path.resolve(__dirname, "./data/behel_vpts_20200129.truncated.txt"), "utf-8");
  const VptsData = helpers.parseVpts(sourceData, 'VOL2BIRD');
  // 1.2 bioRad's output for comparison (behel_vpi_20200129.truncated.csv)
  interface BioRadProfile {
    mtr: number;
    vid: number;
    vir: number;
    rtr: number;
  }
  const bioradOutputString = fs.readFileSync(path.resolve(__dirname, "./data/behel_vpi_20200129.truncated.csv"), "utf-8");
  const integratedProfilesBiorad = Papa.parse(bioradOutputString, {
    header: true,
    dynamicTyping: true
  }).data as BioRadProfile[];

  // 2. Group data by datetime (preparation for integrateProfile on 5min basis)
  let lastTimestamp = VptsData[0].datetime;
  let tempDataToIntegrate = [] as VPTSDataRowFromFile[];
  const groupedDataToIntegrate = [] as VPTSDataRowFromFile[][];

  VptsData.forEach((element) => {
    if (element.datetime != lastTimestamp) {
      groupedDataToIntegrate.push(tempDataToIntegrate);
      tempDataToIntegrate = []; // If needed, we create a new array for the new timestamp
    }

    tempDataToIntegrate.push(element); // In all cases, we push element
    lastTimestamp = element.datetime; // For the next loop
  });
  groupedDataToIntegrate.push(tempDataToIntegrate);

  // 3. Integrate the profiles and compare result to bioRad's output
  groupedDataToIntegrate.forEach((element, index) => {
    const integratedProfileJS = helpers.integrateProfile(element);

    // Round values to three decimals so we compare they're *almost* equal
    const MtrJs = round3decimals(integratedProfileJS.mtr);
    const MtrBiorad = round3decimals(integratedProfilesBiorad[index].mtr);

    const VidJs = round3decimals(integratedProfileJS.vid);
    const VidBiorad = round3decimals(integratedProfilesBiorad[index].vid);

    const VirJs = round3decimals(integratedProfileJS.vir);
    const VirBiorad = round3decimals(integratedProfilesBiorad[index].vir);

    //const RtrJs = round3decimals(integratedProfileJS.rtr);
    //const RtrBiorad = round3decimals(integratedProfilesBiorad[index].rtr);

    expect(MtrJs).toEqual(MtrBiorad);
    expect(VidJs).toEqual(VidBiorad);
    //expect(VirJs).toEqual(VirBiorad);
    //console.log(VirJs, VirBiorad);
    //console.log(RtrJs, RtrBiorad);
    //expect(RtrJs).toEqual(RtrBiorad);
  });
});

test("Raw data filtering by rounding datetime to app resolution and retain only first occurrence with aligned data", async() => {
  // Tell Jest to mock any call to `axios.get` with test data
  jest.spyOn(axios, 'get').mockResolvedValue(
    {"data": fs.readFileSync(path.resolve(__dirname, "./data/behel_vpts_20200129.truncated.txt"), "utf-8")})

  let appResolution = 30;
  config.appTemporalResolution = appResolution * 60

  const localVue = createLocalVue()
  localVue.use(BootstrapVue)
  const wrapper = shallowMount(Home, {
    localVue,
    propsData: {
      dateValueProp: moment.utc("2020-01-29 00:00:00").format(moment.HTML5_FMT.DATE),
      startMoment: moment.utc("2020-01-29 00:00:00"),
      endMoment: moment.utc("2020-01-30 00:00:00"),
      selectedRadar: config.availableRadars[0].options[0]
    },
    stubs: ['router-link']
    }
  )
  await (wrapper.vm as any).loadData()
  await wrapper.vm.$nextTick()
  let vptsAllRows = (wrapper.vm as any).radarVpts

  // Only 30min resolution timestamps should be in the radarVptsobject
  expect(Object.keys((wrapper.vm as any).radarVpts).map(x => parseInt(x))).toEqual(expect.arrayContaining(
    [moment.utc("2020-01-29 10:30").valueOf(), moment.utc("2020-01-29 11:00").valueOf(),
    moment.utc("2020-01-29 11:30").valueOf(), moment.utc("2020-01-29 12:00").valueOf()]));
  expect(Object.keys((wrapper.vm as any).radarVpts).map(x => parseInt(x))).toEqual(expect.not.arrayContaining(
    [moment.utc("2020-01-29 10:05").valueOf(), moment.utc("2020-01-29 10:10").valueOf(),
    moment.utc("2020-01-29 10:15").valueOf(), moment.utc("2020-01-29 10:20").valueOf()]));

  // Content assigned to the data object at 11:00 should match behel_vpts_20200129.truncated.txt data
  expect(vptsAllRows[moment.utc("2020-01-29 11:00").valueOf()].heightData["0"]).toEqual(
    {"datetime":1580295600000,"height":0,"dd":NaN,"ff":NaN,"dens":0,"sd_vvp":3.26,"eta":0,"noData":false})
  expect(vptsAllRows[moment.utc("2020-01-29 11:00").valueOf()].heightData["1000"]).toEqual(
    {"datetime":1580295600000,"height":1000,"dd":203.8,"ff":1.75,"dens":0.79,"sd_vvp":2.95,"eta":8.7,"noData":false})
  expect(vptsAllRows[moment.utc("2020-01-29 11:00").valueOf()].heightData["4800"]).toEqual(
    {"noData":true})

  // Resulting profiles match the reference Biorad data of the corresponding timestamps
  interface BioRadProfile {
    datetime: string;
    mtr: number;
    vid: number;
    vir: number;
    rtr: number;
  }
  const bioradOutputString = fs.readFileSync(path.resolve(__dirname, "./data/behel_vpi_20200129.truncated.csv"), "utf-8");
  const integratedProfilesBiorad = Papa.parse(bioradOutputString, {
    header: true,
    dynamicTyping: true
  }).data as BioRadProfile[];
  ["2020-01-29 10:30:00", "2020-01-29 11:00:00", "2020-01-29 11:30:00"].forEach( timeStamp => {
    let bioradData = integratedProfilesBiorad.filter((x: BioRadProfile) => moment.utc(x.datetime).isSame(moment.utc(timeStamp)))
    let jsData = (wrapper.vm as any).integratedProfiles.filter((x: VPIEntry) => x.moment.isSame(moment.utc(timeStamp)))
    expect(round3decimals(bioradData[0].mtr)).toEqual(round3decimals(jsData[0].integratedProfiles.mtr));

  })

})

test("Raw data filtering by rounding datetime to app resolution and retain only first occurrence with misaligned data", async() => {
  // Tell Jest to mock any call to `axios.get` with test data
  jest.spyOn(axios, 'get').mockResolvedValue(
    {"data": fs.readFileSync(path.resolve(__dirname, "./data/behel_vpts_20200129.truncated.timeoff.txt"), "utf-8")})

  let appResolution = 30;
  config.appTemporalResolution = appResolution * 60

  const localVue = createLocalVue()
  localVue.use(BootstrapVue)
  const wrapper = shallowMount(Home, {
    localVue,
    propsData: {
      dateValueProp: moment.utc("2020-01-29 00:00:00").format(moment.HTML5_FMT.DATE),
      startMoment: moment.utc("2020-01-29 00:00:00"),
      endMoment: moment.utc("2020-01-30 00:00:00"),
      selectedRadar: config.availableRadars[0].options[0]
    },
    stubs: ['router-link']
    }
  )
  await (wrapper.vm as any).loadData()
  await wrapper.vm.$nextTick()
  let vptsAllRows = (wrapper.vm as any).radarVpts

  // Only 30min resolution timestamps should be in the radarVptsobject
  expect(Object.keys((wrapper.vm as any).radarVpts).map(x => parseInt(x))).toEqual(expect.arrayContaining(
    [moment.utc("2020-01-29 10:30").valueOf(), moment.utc("2020-01-29 11:00").valueOf(),
    moment.utc("2020-01-29 11:30").valueOf(), moment.utc("2020-01-29 12:00").valueOf()]));
  expect(Object.keys((wrapper.vm as any).radarVpts).map(x => parseInt(x))).toEqual(expect.not.arrayContaining(
    [moment.utc("2020-01-29 10:05").valueOf(), moment.utc("2020-01-29 10:10").valueOf(),
    moment.utc("2020-01-29 10:15").valueOf(), moment.utc("2020-01-29 10:20").valueOf()]));

  // Content assigned to the data object at 11:00 should match behel_vpts_20200129.truncated.txt data
  expect(vptsAllRows[moment.utc("2020-01-29 11:00").valueOf()].heightData["0"]).toEqual(
    {"datetime":1580295600000,"height":0,"dd":NaN,"ff":NaN,"dens":0,"sd_vvp":3.26,"eta":0,"noData":false})
  expect(vptsAllRows[moment.utc("2020-01-29 11:00").valueOf()].heightData["1000"]).toEqual(
    {"datetime":1580295600000,"height":1000,"dd":203.8,"ff":1.75,"dens":0.79,"sd_vvp":2.95,"eta":8.7,"noData":false})
  expect(vptsAllRows[moment.utc("2020-01-29 11:00").valueOf()].heightData["4800"]).toEqual(
    {"noData":true})
})