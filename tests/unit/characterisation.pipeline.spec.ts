// Characterisation of the data pipeline: for real Wideumont scenarios, pin what
// Home hands to each chart (density grid, integrated profiles, sun periods) and
// the description texts. Any change shows up as a golden file diff; regenerate
// with `npm run test:update-golden` only when the change is intended.
process.env.TZ = "Europe/Brussels"; // results must not depend on the machine's time zone

import moment from "moment-timezone";
import config from "@/config";
import TimelineChart from "@/components/TimelineChart.vue";
import { UserChoicesStoreModule } from "@/store/UserChoicesStore";
import { LangCode, Period, VPIEntry, VPTSDataRow } from "@/CrowTypes";
import { ChartStubs, Scenario, expectGolden, mockMeteoBe, mountHome, restoreMocks, settle, toCsv } from "./support";

export const SCENARIOS: Record<string, Scenario> = {
  // The URL used for the bioRad comparison (inbo/crow#45)
  "bewid-2020-10-13-72h-utc": { radar: "bewid", date: "2020-10-13", interval: 72, timeDisplay: "UTC" },
  // Local time: the window spans two UTC files
  "bewid-2020-10-13-24h-local": { radar: "bewid", date: "2020-10-13", interval: 24, timeDisplay: "radarLocal" },
  // The window starts on 11 Oct 22:00 UTC, a day we have no file for: 2 h without data
  "bewid-2020-10-12-24h-local": { radar: "bewid", date: "2020-10-12", interval: 24, timeDisplay: "radarLocal" },
};

const iso = (ms: number) => new Date(ms).toISOString();

describe.each(Object.entries(SCENARIOS))("pipeline - %s", (name, scenario) => {
  let wrapper: ReturnType<typeof mountHome>;

  beforeAll(async () => {
    config.appTemporalResolution = 10 * 60;
    mockMeteoBe();
    wrapper = mountHome(scenario);
    await settle();
  });
  afterAll(restoreMocks);

  test("density grid passed to the VP chart (heatmap)", () => {
    /*
    Every cell of the heatmap: what the app loaded for each 10 min slot and
    height after downsampling and sd_vvp filtering, or noData. This is the data
    the heatmap colours; a refactor must not change a single cell.
    */
    const rows = (wrapper.findComponent(ChartStubs.VPChart).props("vptsData") as (VPTSDataRow & { timestamp: number })[])
      .map(d => ({ timestamp: iso(d.timestamp), height: d.height, noData: d.noData,
                   dens: d.dens, ff: d.ff, dd: d.dd, sd_vvp: d.sd_vvp, eta: (d as { eta?: number }).eta }))
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp) || (a.height as number) - (b.height as number));
    expectGolden(`${name}.grid.csv`, toCsv(rows));
  });

  test("integrated profiles passed to the VPI chart", () => {
    /*
    MTR, RTR, VID and VIR per slot, i.e. every point of the VPI line in each of
    its four modes. NaN marks a slot without any bird layer (drawn as a gap).
    */
    const rows = (wrapper.findComponent(ChartStubs.VPIChart).props("vpiData") as VPIEntry[])
      .map(e => ({ timestamp: e.moment.toISOString(), ...e.integratedProfiles }));
    expectGolden(`${name}.vpi.csv`, toCsv(rows));
  });

  test("sun periods passed to both timelines", () => {
    /*
    Sun altitude per slot drives the day/twilight/night bands under both
    charts; both timelines must receive the same periods.
    */
    const timelines = wrapper.findAllComponents(TimelineChart);
    expect(timelines.length).toBe(2);
    const periods = timelines.at(0).props("periods") as Period[];
    expect(timelines.at(1).props("periods")).toEqual(periods);
    expectGolden(`${name}.periods.csv`, toCsv(periods.map(p => ({ timestamp: p.moment.toISOString(), sunAltitude: p.sunAltitude }))));
  });

  test("chart settings and description texts", async () => {
    /*
    The other chart props (time zone shown, resolution, modes) and the
    description texts in every language, including the "about N birds" total.
    */
    const vpi = wrapper.findComponent(ChartStubs.VPIChart);
    const vp = wrapper.findComponent(ChartStubs.VPChart);
    const texts: Record<string, string[]> = {};
    for (const lang of ["en", "fr", "nl"] as LangCode[]) {
      UserChoicesStoreModule.setSelectedLanguageCode(lang);
      await wrapper.vm.$nextTick();
      texts[lang] = [vpi.find("p").html(), vp.find("p").html()];
    }
    const meta = {
      window: [UserChoicesStoreModule.startMoment.toISOString(), UserChoicesStoreModule.endMoment.toISOString()],
      vpiChart: { showTimeAs: vpi.props("showTimeAs"), appTemporalResolution: vpi.props("appTemporalResolution"),
                  mode: vpi.props("mode"), loading: vpi.props("loading") },
      vpChart: { showTimeAs: vp.props("showTimeAs"), scheme: vp.props("scheme") },
      totalNumberOfBirds: (wrapper.vm as unknown as { totalNumberOfBirds: number }).totalNumberOfBirds,
      texts
    };
    expectGolden(`${name}.meta.json`, JSON.stringify(meta, null, 2) + "\n");
  });
});

// Keep moment-timezone loaded: the radar-local windows rely on it
void moment;
