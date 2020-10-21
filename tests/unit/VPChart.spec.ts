import { mount } from '@vue/test-utils'
import VPChart from '../../src/components/VPChart.vue'
import 'jest-canvas-mock';
import { createLocalVue } from '@vue/test-utils'
import { BootstrapVue } from 'bootstrap-vue'

// TODO: move test data to other file?
const vtpsData = [ // 1 hr of Helchteren data (Feb 9, 2020, centered around noon local time)
    {
        "timestamp": 1581244200000,
        "height": 0,
        "dd": "__vue_devtool_nan__",  // Due to the fact data was copy-pasted from Chrome Vue dev tools, is it an issue?
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 2.58,
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 3.11,
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 400,
        "dd": 99.8,
        "ff": 0.49,
        "dens": 7.75,
        "sd_vvp": 2.85,
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 600,
        "dd": 263.3,
        "ff": 0.68,
        "dens": 7.29,
        "sd_vvp": 2.58,
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 800,
        "dd": 98.9,
        "ff": 0.67,
        "dens": 0.98,
        "sd_vvp": 2.61,
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 1000,
        "dd": 17,
        "ff": 1.2,
        "dens": 1.27,
        "sd_vvp": 2.44,
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 1200,
        "dd": 241.9,
        "ff": 0.4,
        "dens": 0.24,
        "sd_vvp": 2.04,
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 1400,
        "dd": 30.6,
        "ff": 1.17,
        "dens": 0.64,
        "sd_vvp": 2.45,
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 1600,
        "dd": 228.3,
        "ff": 1.2,
        "dens": 0.46,
        "sd_vvp": 2.32,
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 1800,
        "dd": 320.4,
        "ff": 0.72,
        "dens": 0.12,
        "sd_vvp": 2.25,
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 2000,
        "dd": 355.1,
        "ff": 1.03,
        "dens": 0.14,
        "sd_vvp": 2.24,
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 2200,
        "dd": 187.8,
        "ff": 0.51,
        "dens": 0.07,
        "sd_vvp": 2.15,
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 2400,
        "dd": 70.6,
        "ff": 1.5,
        "dens": 2.24,
        "sd_vvp": 2.93,
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 2600,
        "dd": 186.3,
        "ff": 0.65,
        "dens": 0.06,
        "sd_vvp": 2.46,
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 2800,
        "dd": 241.8,
        "ff": 0.3,
        "dens": 0,
        "sd_vvp": 1.9,
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 3000,
        "dd": 264.9,
        "ff": 0.89,
        "dens": 0.03,
        "sd_vvp": 2.09,
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 3200,
        "dd": 90.3,
        "ff": 36.4,
        "dens": 0.03,
        "sd_vvp": 2.96,
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 3400,
        "dd": 222.4,
        "ff": 0.97,
        "dens": 0.03,
        "sd_vvp": 2.07,
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 3600,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 3800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 4000,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 4200,
        "dd": 89.3,
        "ff": 45.1,
        "dens": 0.05,
        "sd_vvp": 2.7,
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 4400,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 4600,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581244200000,
        "height": 4800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 0,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 2.58,
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 3.04,
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 400,
        "dd": 204,
        "ff": 1.03,
        "dens": 13.41,
        "sd_vvp": 2.73,
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 600,
        "dd": 250.9,
        "ff": 0.7,
        "dens": 3.13,
        "sd_vvp": 2.43,
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 800,
        "dd": 343.2,
        "ff": 0.86,
        "dens": 1.53,
        "sd_vvp": 2.6,
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 1000,
        "dd": 91.9,
        "ff": 0.99,
        "dens": 1.53,
        "sd_vvp": 2.07,
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 1200,
        "dd": 329.3,
        "ff": 0.24,
        "dens": 0,
        "sd_vvp": 1.99,
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 1400,
        "dd": 353.5,
        "ff": 1.02,
        "dens": 0,
        "sd_vvp": 1.99,
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 1600,
        "dd": 183.2,
        "ff": 0.29,
        "dens": 0,
        "sd_vvp": 1.97,
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 1800,
        "dd": 236.6,
        "ff": 0.55,
        "dens": 0,
        "sd_vvp": 1.96,
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 2000,
        "dd": 317.9,
        "ff": 0.7,
        "dens": 0.18,
        "sd_vvp": 2.23,
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 2200,
        "dd": 346.3,
        "ff": 0.35,
        "dens": 0,
        "sd_vvp": 1.88,
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 2400,
        "dd": 178.6,
        "ff": 0.77,
        "dens": 0.1,
        "sd_vvp": 2.21,
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 2600,
        "dd": 249.9,
        "ff": 0.87,
        "dens": 0,
        "sd_vvp": 2,
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 2800,
        "dd": 226.7,
        "ff": 0.44,
        "dens": 0,
        "sd_vvp": 1.93,
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 3000,
        "dd": 274.3,
        "ff": 1.03,
        "dens": 0.04,
        "sd_vvp": 2.07,
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 3200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 3400,
        "dd": 239.8,
        "ff": 1,
        "dens": 0,
        "sd_vvp": 1.8,
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 3600,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 3800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 4000,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 4200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 4400,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 4600,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581244500000,
        "height": 4800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 0,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 2.6,
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 3.02,
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 400,
        "dd": 205.6,
        "ff": 0.56,
        "dens": 6.09,
        "sd_vvp": 2.68,
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 600,
        "dd": 210.7,
        "ff": 0.56,
        "dens": 4.7,
        "sd_vvp": 2.47,
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 800,
        "dd": 90.9,
        "ff": 0.69,
        "dens": 1.35,
        "sd_vvp": 2.52,
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 1000,
        "dd": 73,
        "ff": 1.35,
        "dens": 2.3,
        "sd_vvp": 2.45,
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 1200,
        "dd": 237.7,
        "ff": 0.36,
        "dens": 0.3,
        "sd_vvp": 2.28,
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 1400,
        "dd": 319.1,
        "ff": 0.99,
        "dens": 0.49,
        "sd_vvp": 2.2,
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 1600,
        "dd": 187.2,
        "ff": 0.96,
        "dens": 0.67,
        "sd_vvp": 2.23,
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 1800,
        "dd": 205.7,
        "ff": 0.45,
        "dens": 0.14,
        "sd_vvp": 2.06,
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 2000,
        "dd": 302.9,
        "ff": 1.22,
        "dens": 0.12,
        "sd_vvp": 2.26,
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 2200,
        "dd": 171.7,
        "ff": 0.45,
        "dens": 0,
        "sd_vvp": 1.79,
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 2400,
        "dd": 240.3,
        "ff": 0.81,
        "dens": 0.11,
        "sd_vvp": 2.33,
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 2600,
        "dd": 277.7,
        "ff": 0.51,
        "dens": 0.09,
        "sd_vvp": 2.24,
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 2800,
        "dd": 202.6,
        "ff": 0.66,
        "dens": 0,
        "sd_vvp": 1.81,
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 3000,
        "dd": 288.7,
        "ff": 0.62,
        "dens": 0,
        "sd_vvp": 1.92,
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 3200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 3400,
        "dd": 182.1,
        "ff": 1.72,
        "dens": 0.03,
        "sd_vvp": 2.61,
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 3600,
        "dd": 185.2,
        "ff": 1.21,
        "dens": 0.03,
        "sd_vvp": 2.64,
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 3800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 4000,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 4200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 4400,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 4600,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581244800000,
        "height": 4800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 0,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 2.44,
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 3.04,
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 400,
        "dd": 223.7,
        "ff": 0.69,
        "dens": 3.98,
        "sd_vvp": 2.51,
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 600,
        "dd": 300.4,
        "ff": 0.7,
        "dens": 3.44,
        "sd_vvp": 2.26,
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 800,
        "dd": 78.1,
        "ff": 0.65,
        "dens": 1.28,
        "sd_vvp": 2.49,
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 1000,
        "dd": 351.3,
        "ff": 0.9,
        "dens": 1.31,
        "sd_vvp": 2.27,
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 1200,
        "dd": 236.5,
        "ff": 0.71,
        "dens": 0.64,
        "sd_vvp": 2.22,
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 1400,
        "dd": 277.7,
        "ff": 0.71,
        "dens": 0,
        "sd_vvp": 1.95,
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 1600,
        "dd": 165.8,
        "ff": 0.48,
        "dens": 0,
        "sd_vvp": 1.9,
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 1800,
        "dd": 266.8,
        "ff": 1.09,
        "dens": 0.12,
        "sd_vvp": 2.5,
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 2000,
        "dd": 261.6,
        "ff": 0.53,
        "dens": 0.19,
        "sd_vvp": 2.19,
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 2200,
        "dd": 147,
        "ff": 0.83,
        "dens": 0.2,
        "sd_vvp": 2.18,
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 2400,
        "dd": 171.8,
        "ff": 0.84,
        "dens": 0.29,
        "sd_vvp": 2.34,
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 2600,
        "dd": 206.2,
        "ff": 0.92,
        "dens": 0.11,
        "sd_vvp": 2.36,
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 2800,
        "dd": 275.2,
        "ff": 0.78,
        "dens": 0,
        "sd_vvp": 1.7,
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 3000,
        "dd": 149.1,
        "ff": 0.87,
        "dens": 0,
        "sd_vvp": 1.92,
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 3200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 3400,
        "dd": 260.1,
        "ff": 0.97,
        "dens": 0,
        "sd_vvp": 1.91,
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 3600,
        "dd": 287,
        "ff": 0.74,
        "dens": 0,
        "sd_vvp": 1.77,
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 3800,
        "dd": 298.3,
        "ff": 2.24,
        "dens": 0.03,
        "sd_vvp": 2.53,
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 4000,
        "dd": 179.6,
        "ff": 16.28,
        "dens": 0.04,
        "sd_vvp": 2.58,
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 4200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 4400,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 4600,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581245100000,
        "height": 4800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 0,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 2.74,
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 2.96,
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 400,
        "dd": 203.4,
        "ff": 0.89,
        "dens": 5.83,
        "sd_vvp": 2.39,
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 600,
        "dd": 247.9,
        "ff": 0.6,
        "dens": 6.97,
        "sd_vvp": 2.32,
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 800,
        "dd": 20.3,
        "ff": 0.68,
        "dens": 1.76,
        "sd_vvp": 2.34,
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 1000,
        "dd": 71.2,
        "ff": 0.72,
        "dens": 1.91,
        "sd_vvp": 2.08,
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 1200,
        "dd": 94.7,
        "ff": 0.38,
        "dens": 0,
        "sd_vvp": 1.75,
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 1400,
        "dd": 296.4,
        "ff": 0.86,
        "dens": 0.44,
        "sd_vvp": 2.22,
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 1600,
        "dd": 358.7,
        "ff": 16.6,
        "dens": 0.43,
        "sd_vvp": 3.06,
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 1800,
        "dd": 213.8,
        "ff": 0.71,
        "dens": 0.11,
        "sd_vvp": 2.17,
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 2000,
        "dd": 272.7,
        "ff": 0.84,
        "dens": 0.13,
        "sd_vvp": 2.32,
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 2200,
        "dd": 246.5,
        "ff": 0.96,
        "dens": 0.07,
        "sd_vvp": 2.19,
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 2400,
        "dd": 178.4,
        "ff": 0.84,
        "dens": 0.37,
        "sd_vvp": 2.77,
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 2600,
        "dd": 173.9,
        "ff": 1.17,
        "dens": 0.11,
        "sd_vvp": 2.35,
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 2800,
        "dd": 256.3,
        "ff": 1.09,
        "dens": 0,
        "sd_vvp": 1.95,
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 3000,
        "dd": 233.1,
        "ff": 0.53,
        "dens": 0,
        "sd_vvp": 1.77,
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 3200,
        "dd": 79.8,
        "ff": 0.65,
        "dens": 0.03,
        "sd_vvp": 2.42,
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 3400,
        "dd": 301.7,
        "ff": 0.48,
        "dens": 0.03,
        "sd_vvp": 2.57,
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 3600,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 3800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 4000,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 4200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 4400,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 4600,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581245400000,
        "height": 4800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 0,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 2.7,
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 2.98,
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 400,
        "dd": 291,
        "ff": 1.31,
        "dens": 5.07,
        "sd_vvp": 2.64,
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 600,
        "dd": 246.3,
        "ff": 0.81,
        "dens": 3.25,
        "sd_vvp": 2.21,
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 800,
        "dd": 348.1,
        "ff": 0.66,
        "dens": 1.51,
        "sd_vvp": 2.42,
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 1000,
        "dd": 67.6,
        "ff": 0.8,
        "dens": 1.32,
        "sd_vvp": 2.33,
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 1200,
        "dd": 24.4,
        "ff": 0.49,
        "dens": 0.3,
        "sd_vvp": 2.08,
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 1400,
        "dd": 7.4,
        "ff": 0.84,
        "dens": 0.34,
        "sd_vvp": 2.29,
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 1600,
        "dd": 115.4,
        "ff": 0.64,
        "dens": 0,
        "sd_vvp": 1.98,
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 1800,
        "dd": 252.4,
        "ff": 0.54,
        "dens": 0,
        "sd_vvp": 1.6,
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 2000,
        "dd": 315.1,
        "ff": 0.37,
        "dens": 0,
        "sd_vvp": 1.86,
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 2200,
        "dd": 218,
        "ff": 0.7,
        "dens": 0.1,
        "sd_vvp": 2.38,
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 2400,
        "dd": 306.9,
        "ff": 1.15,
        "dens": 0.33,
        "sd_vvp": 2.53,
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 2600,
        "dd": 105.7,
        "ff": 1.61,
        "dens": 0.1,
        "sd_vvp": 2.49,
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 2800,
        "dd": 235.3,
        "ff": 0.78,
        "dens": 0,
        "sd_vvp": 1.8,
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 3000,
        "dd": 241.4,
        "ff": 0.61,
        "dens": 0,
        "sd_vvp": 1.77,
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 3200,
        "dd": 285.5,
        "ff": 1.35,
        "dens": 0.03,
        "sd_vvp": 2.27,
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 3400,
        "dd": 276.3,
        "ff": 1.07,
        "dens": 0.03,
        "sd_vvp": 2.11,
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 3600,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 3800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 4000,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 4200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 4400,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 4600,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581245700000,
        "height": 4800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 0,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 2.6,
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 2.85,
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 400,
        "dd": 73.4,
        "ff": 0.36,
        "dens": 5.74,
        "sd_vvp": 2.42,
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 600,
        "dd": 352.9,
        "ff": 0.54,
        "dens": 3.09,
        "sd_vvp": 2.29,
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 800,
        "dd": 113.7,
        "ff": 0.85,
        "dens": 1.91,
        "sd_vvp": 2.61,
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 1000,
        "dd": 347.2,
        "ff": 0.8,
        "dens": 1.05,
        "sd_vvp": 2.23,
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 1200,
        "dd": 283.2,
        "ff": 0.55,
        "dens": 0.56,
        "sd_vvp": 2.29,
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 1400,
        "dd": 336.5,
        "ff": 0.95,
        "dens": 0.56,
        "sd_vvp": 2.15,
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 1600,
        "dd": 297.8,
        "ff": 0.58,
        "dens": 0,
        "sd_vvp": 1.94,
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 1800,
        "dd": 131.1,
        "ff": 1.54,
        "dens": 0.12,
        "sd_vvp": 2.5,
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 2000,
        "dd": 18.6,
        "ff": 1.83,
        "dens": 0.23,
        "sd_vvp": 2.84,
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 2200,
        "dd": 177.9,
        "ff": 1.59,
        "dens": 0.1,
        "sd_vvp": 2.74,
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 2400,
        "dd": 359.9,
        "ff": 33.19,
        "dens": 2.09,
        "sd_vvp": 2.8,
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 2600,
        "dd": 0,
        "ff": 31.24,
        "dens": 0.12,
        "sd_vvp": 2.79,
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 2800,
        "dd": 235,
        "ff": 0.51,
        "dens": 0,
        "sd_vvp": 1.9,
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 3000,
        "dd": 241.5,
        "ff": 0.47,
        "dens": 0,
        "sd_vvp": 1.58,
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 3200,
        "dd": 224.1,
        "ff": 0.99,
        "dens": 0.03,
        "sd_vvp": 2.4,
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 3400,
        "dd": 321.2,
        "ff": 1.16,
        "dens": 0,
        "sd_vvp": 1.87,
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 3600,
        "dd": 286.9,
        "ff": 1.34,
        "dens": 0,
        "sd_vvp": 1.76,
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 3800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 4000,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 4200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 4400,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 4600,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246000000,
        "height": 4800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 0,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 2.83,
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 2.92,
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 400,
        "dd": 37,
        "ff": 0.45,
        "dens": 4,
        "sd_vvp": 2.6,
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 600,
        "dd": 266.5,
        "ff": 0.83,
        "dens": 2.29,
        "sd_vvp": 2.27,
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 800,
        "dd": 213.1,
        "ff": 0.69,
        "dens": 1.6,
        "sd_vvp": 2.52,
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 1000,
        "dd": 22.5,
        "ff": 1.06,
        "dens": 1.46,
        "sd_vvp": 2.25,
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 1200,
        "dd": 74.7,
        "ff": 0.73,
        "dens": 0.37,
        "sd_vvp": 2.13,
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 1400,
        "dd": 315.3,
        "ff": 0.92,
        "dens": 0,
        "sd_vvp": 1.93,
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 1600,
        "dd": 27.8,
        "ff": 0.98,
        "dens": 0.78,
        "sd_vvp": 2.51,
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 1800,
        "dd": 196.3,
        "ff": 0.76,
        "dens": 0.17,
        "sd_vvp": 2.27,
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 2000,
        "dd": 37.9,
        "ff": 0.62,
        "dens": 0.22,
        "sd_vvp": 2.33,
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 2200,
        "dd": 28.3,
        "ff": 35.06,
        "dens": 0.12,
        "sd_vvp": 3.2,
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 2400,
        "dd": 56.8,
        "ff": 33.61,
        "dens": 0.28,
        "sd_vvp": 2.36,
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 2600,
        "dd": 7.8,
        "ff": 1.27,
        "dens": 0.12,
        "sd_vvp": 2.64,
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 2800,
        "dd": 327.2,
        "ff": 0.51,
        "dens": 0,
        "sd_vvp": 1.47,
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 3000,
        "dd": 129.1,
        "ff": 0.42,
        "dens": 0,
        "sd_vvp": 1.62,
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 3200,
        "dd": 211.7,
        "ff": 0.7,
        "dens": 0,
        "sd_vvp": 1.74,
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 3400,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 3600,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 3800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 4000,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 4200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 4400,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 4600,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246300000,
        "height": 4800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 0,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 2.59,
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 2.87,
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 400,
        "dd": 108.5,
        "ff": 0.64,
        "dens": 13.44,
        "sd_vvp": 2.73,
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 600,
        "dd": 298.3,
        "ff": 0.92,
        "dens": 4.73,
        "sd_vvp": 2.37,
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 800,
        "dd": 240.3,
        "ff": 0.61,
        "dens": 2.15,
        "sd_vvp": 2.44,
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 1000,
        "dd": 24.3,
        "ff": 0.91,
        "dens": 1.43,
        "sd_vvp": 2.21,
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 1200,
        "dd": 123.8,
        "ff": 0.67,
        "dens": 0.64,
        "sd_vvp": 2.42,
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 1400,
        "dd": 344.1,
        "ff": 0.25,
        "dens": 0,
        "sd_vvp": 1.94,
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 1600,
        "dd": 198,
        "ff": 0.99,
        "dens": 0.58,
        "sd_vvp": 2.7,
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 1800,
        "dd": 219.9,
        "ff": 0.68,
        "dens": 0,
        "sd_vvp": 1.86,
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 2000,
        "dd": 222.5,
        "ff": 1.17,
        "dens": 0.2,
        "sd_vvp": 2.78,
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 2200,
        "dd": 145.1,
        "ff": 1.93,
        "dens": 0.12,
        "sd_vvp": 3.27,
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 2400,
        "dd": 56.3,
        "ff": 33.64,
        "dens": 0.35,
        "sd_vvp": 2.51,
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 2600,
        "dd": 57.9,
        "ff": 33.39,
        "dens": 0.17,
        "sd_vvp": 2.67,
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 2800,
        "dd": 316.9,
        "ff": 0.83,
        "dens": 0,
        "sd_vvp": 1.92,
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 3000,
        "dd": 297.8,
        "ff": 0.51,
        "dens": 0,
        "sd_vvp": 1.89,
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 3200,
        "dd": 195.9,
        "ff": 0.96,
        "dens": 0,
        "sd_vvp": 1.7,
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 3400,
        "dd": 255,
        "ff": 1.34,
        "dens": 0,
        "sd_vvp": 2,
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 3600,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 3800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 4000,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 4200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 4400,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 4600,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246600000,
        "height": 4800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 0,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 2.8,
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 2.98,
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 400,
        "dd": 263.8,
        "ff": 0.97,
        "dens": 3,
        "sd_vvp": 2.42,
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 600,
        "dd": 250,
        "ff": 0.41,
        "dens": 2.87,
        "sd_vvp": 2.41,
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 800,
        "dd": 206.6,
        "ff": 0.3,
        "dens": 1.37,
        "sd_vvp": 2.42,
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 1000,
        "dd": 76.3,
        "ff": 1.08,
        "dens": 1.46,
        "sd_vvp": 2.08,
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 1200,
        "dd": 349.9,
        "ff": 0.71,
        "dens": 0.46,
        "sd_vvp": 2.15,
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 1400,
        "dd": 281.5,
        "ff": 0.75,
        "dens": 0.64,
        "sd_vvp": 2.29,
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 1600,
        "dd": 214.9,
        "ff": 0.73,
        "dens": 0.59,
        "sd_vvp": 2.35,
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 1800,
        "dd": 60.6,
        "ff": 33.01,
        "dens": 0.17,
        "sd_vvp": 3.26,
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 2000,
        "dd": 59.8,
        "ff": 33.02,
        "dens": 0.29,
        "sd_vvp": 2.67,
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 2200,
        "dd": 59.3,
        "ff": 33.11,
        "dens": 0.19,
        "sd_vvp": 2.66,
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 2400,
        "dd": 56.6,
        "ff": 33.31,
        "dens": 0.31,
        "sd_vvp": 2.2,
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 2600,
        "dd": 58.6,
        "ff": 33.2,
        "dens": 0.15,
        "sd_vvp": 2.62,
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 2800,
        "dd": 267.5,
        "ff": 0.76,
        "dens": 0.09,
        "sd_vvp": 2.1,
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 3000,
        "dd": 187.8,
        "ff": 0.75,
        "dens": 0,
        "sd_vvp": 1.65,
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 3200,
        "dd": 353.9,
        "ff": 0.8,
        "dens": 0.04,
        "sd_vvp": 2.39,
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 3400,
        "dd": 63.4,
        "ff": 0.75,
        "dens": 0.03,
        "sd_vvp": 2.34,
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 3600,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 3800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 4000,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 4200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 4400,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 4600,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581246900000,
        "height": 4800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 0,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 2.34,
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 2.88,
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 400,
        "dd": 9.4,
        "ff": 0.51,
        "dens": 8.69,
        "sd_vvp": 2.57,
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 600,
        "dd": 287.5,
        "ff": 0.73,
        "dens": 3.88,
        "sd_vvp": 2.16,
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 800,
        "dd": 195.3,
        "ff": 0.57,
        "dens": 1.78,
        "sd_vvp": 2.4,
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 1000,
        "dd": 59.2,
        "ff": 0.24,
        "dens": 0,
        "sd_vvp": 1.91,
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 1200,
        "dd": 281.9,
        "ff": 0.96,
        "dens": 0.47,
        "sd_vvp": 2.15,
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 1400,
        "dd": 60.3,
        "ff": 33.34,
        "dens": 0.67,
        "sd_vvp": 3.39,
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 1600,
        "dd": 96.4,
        "ff": 1.48,
        "dens": 0.71,
        "sd_vvp": 2.49,
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 1800,
        "dd": 58.5,
        "ff": 33.43,
        "dens": 0.27,
        "sd_vvp": 2.72,
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 2000,
        "dd": 58.8,
        "ff": 33.83,
        "dens": 0.49,
        "sd_vvp": 2.41,
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 2200,
        "dd": 58.4,
        "ff": 33.85,
        "dens": 0.27,
        "sd_vvp": 2.42,
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 2400,
        "dd": 56.9,
        "ff": 33.49,
        "dens": 0.42,
        "sd_vvp": 2,
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 2600,
        "dd": 58.9,
        "ff": 32.83,
        "dens": 0.21,
        "sd_vvp": 2.21,
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 2800,
        "dd": 342.6,
        "ff": 0.65,
        "dens": 0.07,
        "sd_vvp": 2,
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 3000,
        "dd": 72.9,
        "ff": 0.81,
        "dens": 0.04,
        "sd_vvp": 2.07,
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 3200,
        "dd": 143.1,
        "ff": 1,
        "dens": 0.04,
        "sd_vvp": 2.06,
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 3400,
        "dd": 144.8,
        "ff": 0.82,
        "dens": 0.04,
        "sd_vvp": 2.09,
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 3600,
        "dd": 250.6,
        "ff": 1.81,
        "dens": 0.02,
        "sd_vvp": 2.02,
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 3800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 4000,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 4200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 4400,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 4600,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581247200000,
        "height": 4800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 0,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 2.79,
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": 2.83,
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 400,
        "dd": 225.9,
        "ff": 0.82,
        "dens": 7.57,
        "sd_vvp": 2.53,
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 600,
        "dd": 240.8,
        "ff": 0.67,
        "dens": 5.08,
        "sd_vvp": 2.27,
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 800,
        "dd": 241.6,
        "ff": 0.57,
        "dens": 1.88,
        "sd_vvp": 2.29,
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 1000,
        "dd": 17.8,
        "ff": 0.62,
        "dens": 1.43,
        "sd_vvp": 2.3,
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 1200,
        "dd": 279,
        "ff": 1.33,
        "dens": 0.37,
        "sd_vvp": 2.66,
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 1400,
        "dd": 60.9,
        "ff": 33.9,
        "dens": 0.96,
        "sd_vvp": 2.75,
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 1600,
        "dd": 59.5,
        "ff": 34.04,
        "dens": 1.19,
        "sd_vvp": 2.3,
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 1800,
        "dd": 59.2,
        "ff": 34.23,
        "dens": 0.6,
        "sd_vvp": 2.19,
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 2000,
        "dd": 58.3,
        "ff": 34.02,
        "dens": 0.52,
        "sd_vvp": 2.16,
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 2200,
        "dd": 57.1,
        "ff": 33.65,
        "dens": 0,
        "sd_vvp": 1.84,
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 2400,
        "dd": 58.1,
        "ff": 33.71,
        "dens": 0,
        "sd_vvp": 1.59,
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 2600,
        "dd": 60.1,
        "ff": 33.12,
        "dens": 0,
        "sd_vvp": 1.89,
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 2800,
        "dd": 62.5,
        "ff": 17.39,
        "dens": 0.09,
        "sd_vvp": 2.52,
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 3000,
        "dd": 90.3,
        "ff": 1.37,
        "dens": 0.06,
        "sd_vvp": 2.62,
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 3200,
        "dd": 208.2,
        "ff": 1.93,
        "dens": 0.05,
        "sd_vvp": 2.96,
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 3400,
        "dd": 329.6,
        "ff": 0.99,
        "dens": 0.03,
        "sd_vvp": 2.11,
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 3600,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 3800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 4000,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 4200,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 4400,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 4600,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    },
    {
        "timestamp": 1581247500000,
        "height": 4800,
        "dd": "__vue_devtool_nan__",
        "ff": "__vue_devtool_nan__",
        "dens": 0,
        "sd_vvp": "__vue_devtool_nan__",
        "noData": false
    }
]

const localVue = createLocalVue()
localVue.use(BootstrapVue)

const styleConfig = {
    margin: { top: 20, right: 60, bottom: 30, left: 65 },
    width: 1277,
    height: 300,

    showTooltip: false, // BEWARE: useful for debugging, but performance is horrible

    noDataColor: 'grey',

    // The BirdTAM color scale: code + associated color
    birdtamColors: new Map([
        [0, "#ffffff"],
        [1, "#e5ffe5"],
        [2, "#ccffcc"],
        [3, "#b2ffb2"],
        [4, "#99ff99"],
        [5, "#00ff00"],
        [6, "#ffff00"],
        [7, "#ffb2b2"],
        [8, "#ff0000"],
        [9, "#333333"],
    ]),

    axisTimeFormat: " HH:mm z",
    tooltipTimeFormat: "MMM D - HH:mm z",

    yAxisLeftTicks: [0, 1000, 2000, 3000, 4000] // Let's not show all altitudes (too crowded)
};

test('General Chart component rendering & behaviour', () => {
    const wrapper = mount(VPChart, {
        localVue,
        propsData: {
            vtpsData: vtpsData,
            showTimeAs: "Europe/Brussels",
            styleConfig: styleConfig
        }
    });

    expect(wrapper.get('svg'));
});