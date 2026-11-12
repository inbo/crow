// Characterisation of what the charts draw, for the real-data scenarios: the
// SVG geometry and colours, axis ticks and legends. Only meaningful attributes
// are recorded (not whole HTML), so Bootstrap-Vue or Vue 2/3 markup changes do
// not trigger diffs; regenerate with `npm run test:update-golden` only when a
// change is intended.

import config from "@/config";
import VPChart from "@/components/VPChart.vue";
import VPIChart from "@/components/VPIChart.vue";
import TimelineChart from "@/components/TimelineChart.vue";
import { ColorSchemeIdentifier, IntegratedPropertyName } from "@/CrowTypes";
import { Cell, SCENARIOS, advanceClock, expectGolden, mountChart, scenarioChartProps, toCsv, useFakeClock, useRealClock } from "./support";

const SCHEMES: ColorSchemeIdentifier[] = ["viridis", "biorad", "birdtam"];

/** Position and label of every tick of the d3 axis drawn inside `axis`. */
function ticks(axis: Element): string[] {
  return Array.from(axis.querySelectorAll(".tick")).map(t =>
    `${t.getAttribute("transform")} ${t.querySelector("text")?.textContent}`);
}

describe.each(Object.entries(SCENARIOS))("heatmap (VP chart) - %s", (name, scenario) => {
  const drawn: Record<string, Element> = {};
  // Rendering 10,800 cells is slow in jsdom: the 72 h grid is drawn in one scheme only,
  // the per-scheme behaviour is covered by the 24 h scenarios.
  const schemes = scenario.interval === 24 ? SCHEMES : SCHEMES.slice(0, 1);

  beforeAll(async () => {
    config.appTemporalResolution = 10 * 60;
    const { vp } = await scenarioChartProps(scenario);
    for (const scheme of schemes) {
      drawn[scheme] = mountChart(VPChart, { ...vp, styleConfig: config.VPChartStyle, scheme }).element;
    }
  });

  test("every cell's position, size and colour in each colour scheme", () => {
    /*
    The heatmap itself: one rectangle per 10 min slot and height. Geometry must
    not depend on the scheme; the fill per scheme is what the reader decodes as
    density. Recorded for the 24 h scenarios (the 72 h grid has the same logic
    at another cell width, see its axes test).
    */
    const cells: Record<string, Element[]> = {};
    schemes.forEach(scheme => { cells[scheme] = Array.from(drawn[scheme].querySelectorAll("svg#vp-chart > g > rect")); });
    const reference = cells.viridis;
    const geometry = (r: Element) => r.id + "," + ["x", "y", "width", "height"].map(a => r.getAttribute(a)).join(",");
    for (const scheme of schemes) {
      expect(cells[scheme].map(geometry)).toEqual(reference.map(geometry));
    }
    if (scenario.interval !== 24) return;

    const rows = reference.map((r, i) => {
      const [, timestamp, height] = r.id.split("-");
      const row: Record<string, Cell> = {
        timestamp: new Date(+timestamp).toISOString(), height: +height,
        x: +r.getAttribute("x")!, y: +r.getAttribute("y")!, width: +r.getAttribute("width")!, height_px: +r.getAttribute("height")!
      };
      for (const scheme of SCHEMES) row[`fill_${scheme}`] = cells[scheme][i].getAttribute("fill");
      return row;
    });
    expect(rows.length).toBe(144 * 25);
    expectGolden(`${name}.heatmap.csv`, toCsv(rows));
  });

  test("axes, legend and midnight lines in each colour scheme", () => {
    /*
    What lets the reader decode the cells: time axis, height axes in metres and
    feet, the colour legend's tick labels (scale and units per scheme) and the
    midnight lines with their day labels.
    */
    const out: Record<string, unknown> = {};
    for (const scheme of schemes) {
      const root = drawn[scheme];
      const svg = root.querySelector("svg#vp-chart")!;
      // Inside the margin group, in template order: x axis wrapper, metre axis, (cells),
      // feet axis, midnight lines (DailyLines)
      const groups = Array.from(svg.querySelectorAll("svg#vp-chart > g > g"));
      expect(groups.length).toBe(4);
      const [xAxisWrapper, yAxisMeters, yAxisFeet, dailyLines] = groups;
      out[scheme] = {
        size: [svg.getAttribute("width"), svg.getAttribute("height")],
        xAxis: ticks(xAxisWrapper),
        yAxisMeters: ticks(yAxisMeters),
        yAxisFeet: [yAxisFeet.getAttribute("transform"), ...ticks(yAxisFeet)],
        axisLabels: Array.from(svg.querySelectorAll("svg#vp-chart > g > text")).map(t => t.textContent!.trim()),
        legendTicks: Array.from(root.querySelectorAll("form .tick text")).map(t => t.textContent),
        midnightLines: Array.from(dailyLines.querySelectorAll("line")).map(l => `${l.getAttribute("x1")} ${l.getAttribute("style")}`),
        dayLabels: Array.from(dailyLines.querySelectorAll("text")).map(t => `${t.getAttribute("x")} ${t.textContent!.trim()}`)
      };
    }
    expectGolden(`${name}.heatmap-axes.json`, JSON.stringify(out, null, 2) + "\n");
  });
});

const MODES: IntegratedPropertyName[] = ["mtr", "rtr", "vid", "vir"];

/** What the VPI chart draws: the area path, axes, labels and midnight lines. */
function vpiDrawing(root: Element): Record<string, unknown> {
  const svg = root.querySelector("svg#new-vpi-chart")!;
  const margin = svg.querySelector(":scope > g")!;
  // In template order: x axis wrapper, y axis, (label, tooltip, path), midnight lines
  const groups = Array.from(margin.querySelectorAll(":scope > g"));
  return {
    size: [svg.getAttribute("width"), svg.getAttribute("height")],
    noDataText: svg.querySelector(":scope > text")?.textContent?.trim() ?? null,
    path: ["d", "stroke", "fill", "stroke-width"].map(a => margin.querySelector(":scope > path")!.getAttribute(a)),
    yLabel: margin.querySelector(":scope > text")!.textContent!.trim(),
    xAxis: ticks(groups[0]),
    yAxis: ticks(groups[1]),
    midnightLines: groups[2] ? Array.from(groups[2].querySelectorAll("line")).map(l => `${l.getAttribute("x1")} ${l.getAttribute("style")}`) : [],
    dayLabels: groups[2] ? Array.from(groups[2].querySelectorAll("text")).map(t => `${t.getAttribute("x")} ${t.textContent!.trim()}`) : [],
    modeOptions: Array.from(root.querySelectorAll("select option")).map(o => `${(o as HTMLOptionElement).value}: ${o.textContent!.trim()}`)
  };
}

describe.each(Object.entries(SCENARIOS))("VPI chart - %s", (name, scenario) => {
  let vpi: Record<string, unknown>;

  beforeAll(async () => {
    config.appTemporalResolution = 10 * 60;
    vpi = (await scenarioChartProps(scenario)).vpi;
  });

  test("the drawn line, axes and labels in each mode", () => {
    /*
    The VPI line chart for MTR, RTR, VID and VIR: the area path (one point per
    slot, gaps for slots without birds), the value and time axes and the
    labels. This is how the integrated profiles reach the reader.
    */
    const out: Record<string, unknown> = {};
    for (const mode of MODES) {
      out[mode] = vpiDrawing(mountChart(VPIChart, { ...vpi, styleConfig: config.VPIChartStyle, mode }).element);
    }
    expectGolden(`${name}.vpi-chart.json`, JSON.stringify(out, null, 2) + "\n");
  });

  test("switching mode animates to the same drawing as a fresh chart", async () => {
    /*
    Users switch mode with the dropdown, which tweens every point to its new
    value over 300 ms. Once the animation is over, the chart must show exactly
    what a chart opened in that mode shows (e.g. no point stuck midway, NaN
    gaps restored).
    */
    useFakeClock();
    try {
      const wrapper = mountChart(VPIChart, { ...vpi, styleConfig: config.VPIChartStyle, mode: "mtr" });
      await wrapper.find("select").setValue("vid");
      advanceClock(1000);
      await wrapper.vm.$nextTick();
      const fresh = mountChart(VPIChart, { ...vpi, styleConfig: config.VPIChartStyle, mode: "vid" });
      expect(vpiDrawing(wrapper.element)).toEqual(vpiDrawing(fresh.element));
    } finally {
      useRealClock();
    }
  });
});

describe.each(Object.entries(SCENARIOS))("timeline - %s", (name, scenario) => {
  test("day, twilight and night bands", async () => {
    /*
    The bands under both charts: one rectangle per slot whose class (day,
    twilight, night) comes from the sun altitude at the radar. Only band
    changes are recorded, which is what the reader sees.
    */
    config.appTemporalResolution = 10 * 60;
    const { timeline } = await scenarioChartProps(scenario);
    // Tooltips off: one hover popover per band makes jsdom crawl, and they draw nothing until hovered
    const styleConfig = { ...(timeline.styleConfig as object), showTooltip: false };
    const root = mountChart(TimelineChart, { ...timeline, styleConfig }).element;
    const rects = Array.from(root.querySelectorAll("rect"));
    expect(rects.length).toBe((timeline.periods as unknown[]).length);
    const widths = new Set(rects.map(r => r.getAttribute("width")));
    expect(widths.size).toBe(1);

    const bands: string[] = [];
    rects.forEach((r, i) => {
      if (i === 0 || r.getAttribute("class") !== rects[i - 1].getAttribute("class")) {
        bands.push(`${r.getAttribute("x")} ${r.getAttribute("class")}`);
      }
    });
    expectGolden(`${name}.timeline.json`, JSON.stringify({ rectWidth: Array.from(widths)[0], rects: rects.length, bands }, null, 2) + "\n");
  });
});
