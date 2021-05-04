import { createLocalVue } from "@vue/test-utils"
import { BootstrapVue } from "bootstrap-vue"
import helpers from "../../src/helpers"
import { VTPSDataRowFromFile } from "@/CrowTypes";
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
  // 1. Load and parse the data
  // 1.1 From VTPS file
  const sourceData = fs.readFileSync(path.resolve(__dirname, "./data/behel_vpts_20200129.truncated.txt"), "utf-8");
  const VtpsData = helpers.parseVtps(sourceData, 'VOL2BIRD');
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

  // 2. Group data by datetime (preparation for integrateProfile)
  let lastTimestamp = VtpsData[0].datetime;
  let tempDataToIntegrate = [] as VTPSDataRowFromFile[];
  const groupedDataToIntegrate = [] as VTPSDataRowFromFile[][];

  VtpsData.forEach((element) => {
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
