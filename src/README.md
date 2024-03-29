# Architecture and data flow

CROW is implemented as a hierarchy of Vue.js components that can be found in the `src/components` directory. Understanding the role and interface of each component in the tree allows understanding the data flow:

```
App
├── NavBar
│    └── LanguageSelector
├── Home
│    ├── Introduction
│    ├── SiteSelector
│    │   └── SiteSelectorMap
│    ├── VPIChart
│    │   └── DailyLines
│    ├── VPChart
│    │   ├── DailyLines
│    │   └── ColorLegend
│    ├── TimelineChart
│    └── Partners
└── PageFooter
```

_Note: [Vuex](https://vuex.vuejs.org/) is used as a centralized data store since many components act on the same data, and therefore share a common state. Since it was only introduced quite late during CROW's development, it is not yet used for all data that could be considered shared state (those live mainly in the `Home` component). Two Vuex data stores with explicit names are currently implemented: `ConfigStore` and `UserChoicesStore`._<!--TODO: update if fully implemented-->

CROW's configuration and initial selection (form state) is kept in `src/config.ts`.

The most important components of CROW are:

## App

`App` is the root component and implements a few global features such as URL management and page layout (toolbar, footer, ...) but is not very interesting in terms of data flow. It uses Vue Router to extract parameters from the URL and pass them to the `Home` component.

## Home

`Home` is the largest component and in charge of:

- displaying the main form (site, date, interval, ...)
- loading, transforming and passing data to other components in charge of the visualizations. That happens each time the form changes and at inital page load. This process is described in more detail below.

### Data flow

The source data are time series of vertical profiles (`vpts`)generated by [vol2bird](https://github.com/adokter/vol2bird). These are stored on a public file server. The text files contain fixed-width separated values of **variables related to the presence of birds** (density, speed, reflectivity, ...), grouped by date (first column), time (second column) and height (third column). The structure in the source data files is therefore a flat table. See for example the [data file for the radar at site Helchteren](https://opendata.meteo.be/ftp/observations/radar/vbird/behel/2020/behel_vpts_20201101.txt) on November 1st, 2020.

However for performance reasons, the `Home` compoment holds these data in a `radarVpts` variable organized as a tree of objects:

```
radarVpts (Object)
    ├── 1604185200000 (Object - timestamp)
    │   ├── heightData (Object - vertical profile of birds for this timestamp, per altitude)
    │   │   ├── 0 (Object)
    │   │   │   ├── dd: NaN
    │   │   │   ├── dens: 0
    │   │   │   └── ...
    │   │   ├── 1000 (Object)
    │   │   │   ├── dd: 3.24
    │   │   │   └── dens: 1.01
    │   │   └── ...
    │   └── sunAltitude: -53.03 (Number: Sun altitude at the radar site for at this timestamp )
    └── 1604185500000 (Object - timestamp)
        └── ...
```

1. the `radarVpts` object is initialized according to the selected time range and radar. Sun altitudes at site are also computed and set.
2. data file(s) are loaded via AJAX, and their content is used to populate `radarVpts` (more specifically, the various properties in each timestamp -> heightdata entries).
3. these data are transformed via computed properties and passed to the child components (that are in charge of the visulization):
    - `VPChart` receives a flattened version of `radarVpts` (`radarVptsAsArray`, similar to the structure of the initial data files)
    - `VPIChart` receives vertically integrated profiles (see `integrateProfile` function in `helpers.ts`).
    - `TimelineChart` receives a simple array with the sun altitude for each shown time period.

It makes use of a few more child components for modularity reasons: `SiteSelector`, `Introduction`, ... 

## VPIChart

`VPIChart` visualizes the integrated values (MTR, VID, ...) with D3. It uses the `DailyLines` component to show vertical lines on the chart each day at midnight.

## VPChart

`VPChart` visualizes the raw VPTS data as a heatmap (bird density in function of the time and altitude) with D3. It uses the `DailyLines` component to show vertical lines on the chart each day at midnight and `ColorLegend` to show a legend for the 3 availables colour scales.
