// Shared test support. Everything specific to the test runner (Jest) or to the
// Vue 2 test utils lives here, so that porting the suite to Vue 3 / Vitest means
// changing this file, not the specs.
import { createLocalVue, mount, shallowMount, Wrapper } from "@vue/test-utils";
import { BootstrapVue } from "bootstrap-vue";
import VueClipboard from "vue-clipboard2";
import axios from "axios";
import Vue, { Component } from "vue";
import Home from "@/components/Home.vue";
import { TimeDisplayedAsValue } from "@/CrowTypes";
import "jest-canvas-mock";

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.resolve(__dirname, "./data");
const GOLDEN_DIR = path.resolve(__dirname, "./golden");

// --- Real data -------------------------------------------------------------

export const BEWID_DATES = ["20201012", "20201013", "20201014"];

export function readDataFile(name: string): string {
  return fs.readFileSync(path.join(DATA_DIR, name), "utf-8");
}

export function readBewid(): string[] {
  return BEWID_DATES.map(d => readDataFile(`bewid_vpts_${d}.txt`));
}

/** Rows of a CSV written by generate_biorad_references.R, as string arrays (header dropped). */
export function readBioradCsv(name: string): string[][] {
  return readDataFile(name).trim().split("\n").slice(1).map(l => l.replace(/"/g, "").split(","));
}

// --- Faking the meteo.be server -------------------------------------------

/**
 * Serve the bewid files by date, whatever the radar in the URL. Dates we have no
 * file for get an empty vol2bird file: the real server answers 404 and the app
 * then stores nothing, but a rejected promise is not handled by the app and would
 * crash the test worker. `override` serves something else for chosen URLs.
 */
export function mockMeteoBe(override: (url: string) => Promise<unknown> | undefined = () => undefined): void {
  const byDate: Record<string, string> = {};
  readBewid().forEach((content, i) => { byDate[BEWID_DATES[i]] = content; });
  jest.spyOn(axios, "get").mockImplementation((url: string) => {
    const overridden = override(url);
    if (overridden) return overridden as Promise<never>;
    const match = url.match(/_vpts_(\d{8})\.txt$/);
    const data = match && byDate[match[1]] ? byDate[match[1]] : "#\n#\n#\n#\n\n";
    return Promise.resolve({ data });
  });
}

export function restoreMocks(): void {
  jest.restoreAllMocks();
}

/** Let watchers, $nextTick callbacks and mocked downloads all run. */
export async function settle(): Promise<void> {
  for (let i = 0; i < 5; i++) await new Promise(r => setTimeout(r, 0));
}

// --- Mounting --------------------------------------------------------------

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(VueClipboard);

export interface Scenario {
  radar: string;
  date: string;
  interval: number;
  timeDisplay: TimeDisplayedAsValue;
}

/** The real-data scenarios shared by the characterisation specs. */
export const SCENARIOS: Record<string, Scenario> = {
  // The URL used for the bioRad comparison (inbo/crow#45)
  "bewid-2020-10-13-72h-utc": { radar: "bewid", date: "2020-10-13", interval: 72, timeDisplay: "UTC" },
  // Local time: the window spans two UTC files
  "bewid-2020-10-13-24h-local": { radar: "bewid", date: "2020-10-13", interval: 24, timeDisplay: "radarLocal" },
  // The window starts on 11 Oct 22:00 UTC, a day we have no file for: 2 h without data
  "bewid-2020-10-12-24h-local": { radar: "bewid", date: "2020-10-12", interval: 24, timeDisplay: "radarLocal" },
};

/** Stand-in for a chart that keeps its props and renders its slots (description text, timeline). */
function chartStub(name: string, props: string[]): Component {
  return Vue.extend({ name, props, template: `<div class="stub-${name}"><slot name="header" /><slot name="in-x-axis-group" /></div>` });
}

export const ChartStubs = {
  VPIChart: chartStub("VPIChart", ["vpiData", "styleConfig", "showTimeAs", "appTemporalResolution", "mode", "loading"]),
  VPChart: chartStub("VPChart", ["vptsData", "styleConfig", "scheme", "showTimeAs"]),
};

/** Mount Home for a scenario, with the charts replaced by stubs that record their props. */
export function mountHome(s: Scenario): Wrapper<Vue> {
  return shallowMount(Home, {
    localVue,
    propsData: { radarValueProp: s.radar, dateValueProp: s.date, intervalValueProp: s.interval, timeDisplayValueProp: s.timeDisplay },
    stubs: { "router-link": true, "v-p-i-chart": ChartStubs.VPIChart, "v-p-chart": ChartStubs.VPChart }
  });
}

/** Props received by the given child component (a stub from ChartStubs, or a real component). */
export function childProps(wrapper: Wrapper<Vue>, child: Component): Record<string, unknown> {
  return wrapper.findComponent(child).props();
}

/** Load a scenario through Home (stubbed charts) and return the props it gives the charts. */
export async function scenarioChartProps(s: Scenario): Promise<{ vpi: Record<string, unknown>; vp: Record<string, unknown> }> {
  mockMeteoBe();
  const wrapper = mountHome(s);
  await settle();
  const props = { vpi: wrapper.findComponent(ChartStubs.VPIChart).props(), vp: wrapper.findComponent(ChartStubs.VPChart).props() };
  wrapper.destroy();
  restoreMocks();
  return props;
}

/** Mount a chart component on its own, fully rendered. */
export function mountChart(component: Component, props: Record<string, unknown>): Wrapper<Vue> {
  return mount(component, { localVue, propsData: props });
}

// --- Golden files ----------------------------------------------------------

export type Cell = string | number | boolean | null | undefined;

/** Fixed, diff-friendly text for a value: 6 significant decimals, NaN spelt out. */
function formatCell(v: Cell): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "number") return Number.isNaN(v) ? "NaN" : String(Math.round(v * 1e6) / 1e6);
  const text = String(v);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; // e.g. "rgb(68, 1, 84)"
}

export function toCsv(rows: Record<string, Cell>[]): string {
  if (rows.length === 0) return "";
  const columns = Object.keys(rows[0]);
  return [columns.join(","), ...rows.map(r => columns.map(c => formatCell(r[c])).join(","))].join("\n") + "\n";
}

/**
 * Compare `actual` with tests/unit/golden/<name>. Run with UPDATE_GOLDEN=1
 * (npm run test:update-golden) to (re)write the file instead; review the diff in git.
 * On mismatch, reports the first differing line rather than a whole-file diff.
 */
export function expectGolden(name: string, actual: string): void {
  const file = path.join(GOLDEN_DIR, name);
  if (process.env.UPDATE_GOLDEN) {
    fs.mkdirSync(GOLDEN_DIR, { recursive: true });
    fs.writeFileSync(file, actual);
    return;
  }
  if (!fs.existsSync(file)) {
    throw new Error(`Golden file ${name} is missing: run npm run test:update-golden`);
  }
  const expectedLines = fs.readFileSync(file, "utf-8").split("\n");
  const actualLines = actual.split("\n");
  const firstDiff = expectedLines.findIndex((line: string, i: number) => line !== actualLines[i]);
  expect({ file: name, line: firstDiff + 1, header: actualLines[0], content: actualLines[firstDiff] })
    .toEqual({ file: name, line: firstDiff + 1, header: expectedLines[0], content: expectedLines[firstDiff] });
  expect(actualLines.length).toBe(expectedLines.length);
}
