import { mount } from '@vue/test-utils'
import NewTimelineChart from '../../src/components/NewTimelineChart'
import moment from 'moment-timezone';

let styleConfig = {
    margin: { top: 0, right: 60, bottom: 5, left: 65 },
    width: 1277, // 1152 forn the graph, after we remove margins
    height: 50,

    timeAxisFormat: " D-M@HH:mm z",

    showXAxis: true,
    showTooltip: true,

    dayColor: '#dae9fe',
    twilightColor: '#4771bb',
    nightColor: '#1e252d'
}


let testPeriods = [
    {"moment": moment("2020-01-23T10:30:00.000Z"), "sunAltitude": 19.200964203532266},
    {"moment": moment("2020-01-23T10:35:00.000Z"), "sunAltitude": 19.26350235809867},
    {"moment": moment("2020-01-23T10:40:00.000Z"), "sunAltitude": 19.309003099210862},
    {"moment": moment("2020-01-23T10:45:00.000Z"), "sunAltitude": 19.33743073598932},
    {"moment": moment("2020-01-23T10:50:00.000Z"), "sunAltitude": 19.348762956779822},
    {"moment": moment("2020-01-23T10:55:00.000Z"), "sunAltitude": 19.342990938899007},
    {"moment": moment("2020-01-23T11:00:00.000Z"), "sunAltitude": 19.32011936805931},
    {"moment": moment("2020-01-23T11:05:00.000Z"), "sunAltitude": 19.280166422415686},
    {"moment": moment("2020-01-23T11:10:00.000Z"), "sunAltitude": 19.223163700614474},
    {"moment": moment("2020-01-23T11:15:00.000Z"), "sunAltitude": 19.149156143705536},
    {"moment": moment("2020-01-23T11:20:00.000Z"), "sunAltitude": 19.05820181861885},
    {"moment": moment("2020-01-23T11:25:00.000Z"), "sunAltitude": 18.950371795084237},
]

test('General TimelineChart component rendering', () => {
  const wrapper = mount(NewTimelineChart, {
    propsData: {
        styleConfig: styleConfig,
        dataTemporalResolution: 300,
        showTimeAs: "Europe/Brussels",
        periods: testPeriods
      }
  });

  expect(wrapper.contains('svg')).toBe(true);

  // To cover 1 hours by 5 minutes increment, we need 12 rectangles
  expect(wrapper.findAll('rect').length).toBe(12);

  // After removing margins, we have 1152 pixels for the data. So each of the 12 rectangle must be 96px wide
  expect(wrapper.find('rect').attributes('width')).toBe("96");

  // We want to display time as in Brussels, but the data is in UTC, so the range of the axis should be 11:30 - 12:25 and mention CET time
  expect(wrapper.find('g.tick text').text()).toBe("23-1@11:30 CET");

  const lastTickText = wrapper.findAll('g.tick text').at(11)
  expect(lastTickText.text()).toBe("23-1@12:25 CET")

  //console.log(wrapper.html({ prettyPrint: true}));
});

// TODO: test popover can be enabled/disabled
// TOTO: check popover content
// TODO: test axis can be disabled
// TODO: should we split in multiple "test" blocks

test('TimelineChart axis texts in UTC mode', () => {
  const wrapper = mount(NewTimelineChart, {
    propsData: {
        styleConfig: styleConfig,
        dataTemporalResolution: 300,
        showTimeAs: "UTC",
        periods: testPeriods
      }
  });

  // Data in UTC, display too. So the ticks should match the passed data, and have the 'UTC' mention
  expect(wrapper.find('g.tick text').text()).toBe("23-1@10:30 UTC");
  const lastTickText = wrapper.findAll('g.tick text').at(11)
  expect(lastTickText.text()).toBe("23-1@11:25 UTC")
});