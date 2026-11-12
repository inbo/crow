// Characterisation of the data pipeline: for real Wideumont scenarios, pin what
// Home hands to each chart (density grid, integrated profiles, sun periods) and
// the description texts. Any change shows up as a golden file diff; regenerate
// with `npm run test:update-golden` only when the change is intended.

import config from "@/config";
import TimelineChart from "@/components/TimelineChart.vue";
import { UserChoicesStoreModule } from "@/store/UserChoicesStore";
import { LangCode, Period, VPIEntry, VPTSDataRow } from "@/CrowTypes";
import { ChartStubs, SCENARIOS, expectGolden, mockMeteoBe, mountHome, readBioradCsv, restoreMocks, settle, toCsv } from "./support";


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


describe("heatmap densities against bioRad", () => {
  test("every cell with data equals bioRad's regularised 10 min grid", async () => {
    /*
    Independent check of the heatmap numbers, not just a pin: bioRad 0.12.0's
    regularize_vpts() on the same files gives, for each 10 min slot and height,
    the density of the profile at that time. Every cell CROW shows with data
    must have that density (a NaN density counts as 0 on both sides, see
    filterVpts). Cells shown as no data are not compared: CROW deliberately
    hides layers failing the sd_vvp filter, which bioRad's grid keeps.
    */
    config.appTemporalResolution = 10 * 60;
    mockMeteoBe();
    const wrapper = mountHome(SCENARIOS["bewid-2020-10-13-72h-utc"]);
    await settle();
    const reference = new Map<string, number>();
    for (const [datetime, height, dens] of readBioradCsv("bewid_20201012-14.biorad_vpts_10min.csv")) {
      reference.set(`${datetime}/${height}`, dens === "NA" || dens === "NaN" ? 0 : +dens);
    }
    const cells = (wrapper.findComponent(ChartStubs.VPChart).props("vptsData") as (VPTSDataRow & { timestamp: number })[])
      .filter(d => !d.noData);
    expect(cells.length).toBeGreaterThan(5000);
    const differing = cells
      .map(d => ({ key: `${new Date(d.timestamp).toISOString().replace(".000Z", "Z")}/${d.height}`, crow: d.dens }))
      .filter(c => Math.abs((c.crow as number) - reference.get(c.key)!) > 1e-9);
    expect(differing).toEqual([]);
    restoreMocks();
  });
});
