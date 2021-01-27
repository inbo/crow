import { mount } from "@vue/test-utils"
import TimelineChart from "../../src/components/TimelineChart"
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
  const wrapper = mount(TimelineChart, {
    propsData: {
      styleConfig: styleConfig,
      dataTemporalResolution: 300,
      showTimeAs: "Europe/Brussels",
      periods: testPeriods
    }
  });

  // To cover 1 hours by 5 minutes increment, we need 12 rectangles
  expect(wrapper.findAll("rect").length).toBe(12);

  // After removing margins, we have 1152 pixels for the data. So each of the 12 rectangle must be 96px wide
  expect(wrapper.find("rect").attributes("width")).toBe("96");

  // With this basic dataset, everything should be 'day'
  wrapper.findAll("rect").wrappers.forEach(wp => expect(wp.classes()).toContain("day"));

  // Check it can correctly autodetect the temporal resolution (5 minutes)
  expect(wrapper.vm.dataTemporalResolution).toBe(5 * 60);
});

test("Have popovers when asked in the config", () => {
  const wrapper = mount(TimelineChart, {
    propsData: {
      styleConfig: styleConfig,
      dataTemporalResolution: 300,
      showTimeAs: "Europe/Brussels",
      periods: testPeriods
    }
  });

  expect(wrapper.get("b-popover"));
  expect(wrapper.findAll("b-popover").length).toBe(12); // 1 per period
  // TODO: check popover content
});

test("Don't have popovers when asked in the config", () => {
  let disabledPopoverconfig = styleConfig;
  disabledPopoverconfig.showTooltip = false;
  
  const wrapper = mount(TimelineChart, {
    propsData: {
      styleConfig: disabledPopoverconfig,
      dataTemporalResolution: 300,
      showTimeAs: "Europe/Brussels",
      periods: testPeriods
    }
  });

  expect(wrapper.find("b-popover").exists()).toBe(false);
});


// TODO: check popover content

test("TimelineChart axis can be disabled", () => {
  let disabledAxisconfig = styleConfig;
  disabledAxisconfig.showXAxis = false;

  const wrapper = mount(TimelineChart, {
    propsData: {
      styleConfig: disabledAxisconfig,
      dataTemporalResolution: 300,
      showTimeAs: "UTC",
      periods: testPeriods
    }
  });
  expect(wrapper.find("g.tick").exists()).toBe(false);
});
