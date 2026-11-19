import { mountChart } from "./support"
import { useUserChoicesStore } from "../../src/store/UserChoicesStore"
import TimelineChart from "../../src/components/TimelineChart.vue"
import moment from "moment-timezone";

let styleConfig = {
  margin: { top: 0, right: 60, bottom: 5, left: 65 },
  width: 1277, // 1152 forn the graph, after we remove margins
  height: 50,

  timeDisplayFormat: " D-M@HH:mm z",

  showTooltip: true,

  dayColor: "#dae9fe",
  twilightColor: "#4771bb",
  nightColor: "#1e252d"
}

let testPeriods = [
  { "moment": moment("2020-01-23T10:30:00.000Z"), "sunAltitude": 19.200964203532266 },
  { "moment": moment("2020-01-23T10:35:00.000Z"), "sunAltitude": 19.26350235809867 },
  { "moment": moment("2020-01-23T10:40:00.000Z"), "sunAltitude": 19.309003099210862 },
  { "moment": moment("2020-01-23T10:45:00.000Z"), "sunAltitude": 19.33743073598932 },
  { "moment": moment("2020-01-23T10:50:00.000Z"), "sunAltitude": 19.348762956779822 },
  { "moment": moment("2020-01-23T10:55:00.000Z"), "sunAltitude": 19.342990938899007 },
  { "moment": moment("2020-01-23T11:00:00.000Z"), "sunAltitude": 19.32011936805931 },
  { "moment": moment("2020-01-23T11:05:00.000Z"), "sunAltitude": 19.280166422415686 },
  { "moment": moment("2020-01-23T11:10:00.000Z"), "sunAltitude": 19.223163700614474 },
  { "moment": moment("2020-01-23T11:15:00.000Z"), "sunAltitude": 19.149156143705536 },
  { "moment": moment("2020-01-23T11:20:00.000Z"), "sunAltitude": 19.05820181861885 },
  { "moment": moment("2020-01-23T11:25:00.000Z"), "sunAltitude": 18.950371795084237 },
]

test("General TimelineChart component rendering & behaviour", () => {
  /*
  One hour of 5 min periods draws 12 equal day bands over the 1152 px plot
  width, and the chart infers the 5 min resolution from the periods: the bands
  must line up with the heatmap columns above them.
  */
  const wrapper = mountChart(TimelineChart, {
    styleConfig: styleConfig,
    dataTemporalResolution: 300,
    showTimeAs: "Europe/Brussels",
    periods: testPeriods
  });

  // To cover 1 hours by 5 minutes increment, we need 12 rectangles
  expect(wrapper.findAll("rect").length).toBe(12);

  // After removing margins, we have 1152 pixels for the data. So each of the 12 rectangle must be 96px wide
  expect(wrapper.find("rect").attributes("width")).toBe("96");

  // With this basic dataset, everything should be 'day'
  wrapper.findAll("rect").forEach(wp => expect(wp.classes()).toContain("day"));

  // Check it can correctly autodetect the temporal resolution (5 minutes)
  expect(wrapper.vm.dataTemporalResolution).toBe(5 * 60);
});

test("Have popovers when asked in the config", () => {
  /*
  With showTooltip on, each period gets its own popover (12 for one hour), so
  hovering any band shows its time and sun elevation. The popovers are mounted
  under <body> (an SVG element cannot hold them), so they are counted there.
  */
  const before = document.body.querySelectorAll(".popover").length;
  mountChart(TimelineChart, {
    styleConfig: styleConfig,
    dataTemporalResolution: 300,
    showTimeAs: "Europe/Brussels",
    periods: testPeriods
  });

  expect(document.body.querySelectorAll(".popover").length - before).toBe(12); // 1 per period
});

test("Popovers show the period time, name and sun elevation", async () => {
  /*
  Each band's popover has the period start as title (in the selected time
  display, with the tooltip format) and the translated, capitalised period name
  with the sun elevation rounded to 2 decimals as body. A sun at -5 degrees is
  twilight, not night (night starts below -18). The text follows the selected
  language.
  */
  const before = document.body.querySelectorAll(".popover").length;
  mountChart(TimelineChart, {
    styleConfig: { ...styleConfig, showTooltip: true, tooltipTimeFormat: "MMM D - HH:mm z" },
    showTimeAs: "UTC",
    periods: [
      { moment: moment("2020-01-23T10:30:00.000Z"), sunAltitude: 19.200964203532266 },
      { moment: moment("2020-01-23T10:35:00.000Z"), sunAltitude: -5 }
    ]
  });
  const popovers = () => [...document.body.querySelectorAll(".popover")].slice(before)
    .map(p => [p.querySelector(".popover-header").textContent, p.querySelector(".popover-body").textContent]);

  expect(popovers()).toEqual([
    ["Jan 23 - 10:30 UTC", "Day (solar elevation angle : 19.20\u00b0)"],
    ["Jan 23 - 10:35 UTC", "Twilight (solar elevation angle : -5.00\u00b0)"]
  ]);

  useUserChoicesStore().setSelectedLanguageCode("fr");
  await new Promise(resolve => setTimeout(resolve));
  expect(popovers()[1][1]).toBe("Cr\u00e9puscule (angle d'\u00e9l\u00e9vation solaire : -5.00\u00b0)");
  useUserChoicesStore().setSelectedLanguageCode("en");
});

test("Don't have popovers when asked in the config", () => {
  /*
  With showTooltip off, no popover is created at all: they are costly when the
  chart covers 72 h, so the config switch must really remove them.
  */
  const before = document.body.querySelectorAll(".popover").length;
  let disabledPopoverconfig = styleConfig;
  disabledPopoverconfig.showTooltip = false;
  
  mountChart(TimelineChart, {
    styleConfig: disabledPopoverconfig,
    dataTemporalResolution: 300,
    showTimeAs: "Europe/Brussels",
    periods: testPeriods
  });

  expect(document.body.querySelectorAll(".popover").length).toBe(before);
});


test("TimelineChart axis can be disabled", () => {
  /*
  With showXAxis off, no tick is drawn: the timeline sits inside the other
  charts' x axis and must not draw a second one.
  */
  let disabledAxisconfig = styleConfig;
  disabledAxisconfig.showXAxis = false;

  const wrapper = mountChart(TimelineChart, {
    styleConfig: disabledAxisconfig,
    dataTemporalResolution: 300,
    showTimeAs: "UTC",
    periods: testPeriods
  });
  expect(wrapper.find("g.tick").exists()).toBe(false);
});
