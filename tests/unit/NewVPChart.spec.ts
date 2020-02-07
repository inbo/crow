import { mount } from '@vue/test-utils'
import NewVPChart from '../../src/components/NewVPChart.vue'

const styleConfig = {
    margin: { top: 20, right: 60, bottom: 30, left: 65 },
    width: 1277,
    height: 300,

    minDensityColor: '#f0f0f0',
    maxDensityColor: '#dc3545',
    noDataColor: 'white',

    timeAxisFormat: " D-M@HH:mm z",

    yAxisLeftTicks: [0, 1000, 2000, 3000, 4000]
};

test('General Chart component rendering & behaviour', () => {
    const wrapper = mount(NewVPChart, {
      propsData: {
        vtpsData: [],
        showTimeAs: "Europe/Brussels",
        styleConfig: styleConfig
      }
    });

    expect(wrapper.contains('svg')).toBe(true);
});