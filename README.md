# Crow

Crow is a single-page application to visualize bird migration as detected by weather radars. Implemented in [TypeScript](https://www.typescriptlang.org/), makes use of the [Vue CLI](https://cli.vuejs.org/) toolkit, [D3](https://d3js.org/) and [BootstrapVue](https://bootstrap-vue.js.org/).

## Howto: installation and development

Install with:

```
npm install
```

Run in development with:

```
npm run serve
```

Run unit tests with:

```
npm run test:unit
```

## Howto: deployment (to <https://inbo.github.io/crow/>)

**This is now done automatically, each time code is pushed to GitHub on the `master` branch.**

Manual procedure, if ever needed

```
npm run build
```

Then move the (newly generated) content of the `docs` directory to the root of the `gh-pages` branch, and push it to GitHub.

## Architecture and data flow

CROW is implemented as a hierarchy of Vue.js components that can be found in the `src/components` directory. Understanding the role and interface of each component in the tree allows understanding the data flow.

    App
    ├── NavBar
    │    └── LanguageSelector
    ├── Home
    │    ├── Introduction
    │    ├── SiteSelector
    │    │   └── SiteSelectorMap
    │    ├── VPChart
    │    │   ├── DailyLines
    │    │   └── ColorLegend
    │    ├── VPIChart
    │    │   └── DailyLines
    │    ├── TimelineChart
    │    └── Partners       
    └── PageFooter

**Note**: Vuex is used as a centralized data store since many components acts on the same data, and therefore share a common state. Since it was only introduced quite late during CROW's development, it is not yet used for all bits of data that could be considered shared state (those live mainly in the `Home` component). Two Vuex data store with explicit names are currently implemented: `ConfigStore` and `UserChoicesStore`.

**Note**: CROW's configuration and initial selection (form state) is kept in `src/config.ts`.

The most important components of CROW are:

### App

`App` is the root component and implements a few global features such as URL management and page layout (toolbar, footer, ...) but is not very interesting in terms of data flow. It uses Vue Router to extract parameters from the URL and pass them to the `Home` component.

### Home

Home is the largest component and in charge of:

- displaying the main form (at site, date, interval, ...)
- loading, transforming and passing (to other components in charge of the visualizations) the data. That happens each time the form change, and at inital page load. 

This process is described with more details below:

The data originates in data files (vertical profile of birds, generated by [vol2bird](https://github.com/adokter/vol2bird)) stored on an HTTP server. Those (tab-separated values) text files contains several variables related to the presence of birds (density, speed, reflectivity, ...), grouped by date (first column), time (second column) and height (third column). The structure in the source data files is therefore a flat table. See for example the [data file for the radar at site Helcheteren](https://opendata.meteo.be/ftp/observations/radar/vbird/behel/2020/behel_vpts_20201101.txt) on November 1st, 2020.

However for performance reasons, the Home compoment holds this data in a `radarVtps` variable organized as a tree of objects.


    radarVtps (Object)
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



1) the `radarVtps` object is initialized according to the selected time range and radar. Sun altitudes at site are also computed and set.
2) data file(s) are loaded via AJAX, and their content is used to populate `radarVtps` (more specifically, the various properties in each timestamp -> heightdata entries)
3) this data is transformed via computed properties and passed to the child components (that are in charge of the visulization): `VPChart` receive a flattened version of `radarVtps` (`radarVtpsAsArray`, similar to the structure of the initial data files), `VPIChart` receives vertically integrated profiles (see `integrateProfile` function in `helpers.ts`) and `TimelineChart` receive a simple array with the sun altitude for each shown time period.

It makes use of a few more child components for modularity reasons: `SiteSelector`, `Introduction`, ... 

### VPIChart

Use D3 to visualize the integrated values: MTR, VID, ... It uses the `DailyLines` component to show vertical lines on the chart each day at midnight.

### VPChart

Use D3 to visualize the raw VTPS data as a heatmap (bird density in function of the time and altitude) It uses the `DailyLines` component to show vertical lines on the chart each day at midnight, and `ColorLegend` to show a legend for the 3 availables colour scales.
