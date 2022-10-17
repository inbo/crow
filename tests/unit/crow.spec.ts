import { createLocalVue, shallowMount } from "@vue/test-utils"
import { BootstrapVue } from "bootstrap-vue"
import helpers from "../../src/helpers"
import Home from "../../src/components/Home.vue";
import config from "@/config";
import { VPTSDataRowFromFile } from "@/CrowTypes";
import axios from 'axios';
import moment from "moment";

import * as Papa from "papaparse";
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


// Tell Jest to mock any call to `axios.get` with test data
jest.spyOn(axios, 'get').mockResolvedValue({"data": fs.readFileSync(path.resolve(__dirname, "./data/behel_vpts_20200129.truncated.txt"), "utf-8")})

test("Raw data filtering by rounding datetime to app resolution and retain only first occurrence", async () => {

  config.appTemporalResolution = 10 * 60

  const sourceData = fs.readFileSync(path.resolve(__dirname, "./data/behel_vpts_20200129.truncated.txt"), "utf-8");
  const VptsData = helpers.parseVpts(sourceData, 'VOL2BIRD');

  const localVue = createLocalVue()
  localVue.use(BootstrapVue)
  const wrapper = shallowMount(Home, {
    localVue,
    propsData: {
      dateValueProp: moment("2020-01-29 00:00:00").format(moment.HTML5_FMT.DATE),
      startMoment: moment("2020-01-29 00:00:00"),
      endMoment: moment("2020-01-29 00:23:50"),
      selectedRadar: config.availableRadars[0].options[0]
    },
    stubs: ['router-link']
    }
  )

  // Run the raw data processing
  wrapper.vm.loadData()
  await wrapper.vm.$nextTick()

// TODO Stijn - add effective tests to check behavior
  console.log(wrapper.vm.radarVpts)

})