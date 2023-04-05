# CROW - Online tool to visualize birds detected by weather radars

<!-- badges: start -->
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.4629448.svg)](https://doi.org/10.5281/zenodo.4629448)
[![Run tests and deploy to GitHub pages if successful](https://github.com/inbo/crow/actions/workflows/test-and-deploy.yml/badge.svg)](https://github.com/inbo/crow/actions/workflows/test-and-deploy.yml)
<!-- badges: end -->

CROW is a single-page application to visualize birds detected by weather radars. It visualizes [`vpts`](https://adokter.github.io/bioRad/reference/summary.vpts.html#details) data from a public repository directly in the browser and can thus be hosted on a static file server. As it only visualizes data from one radar at a time, it is easily scalable.

CROW is implemented in [TypeScript](https://www.typescriptlang.org/) and makes use of the [Vue CLI toolkit](https://cli.vuejs.org/), [D3](https://d3js.org/) and [BootstrapVue](https://bootstrap-vue.js.org/).

CROW was jointly developed by the [Research Institute for Nature and Forest (INBO)](https://www.inbo.be) and the [Royal Meteorological Institute of Belgium (RMI)](https://www.meteo.be) in collaboration with the [Royal Belgian Institute for Natural Sciences (RBINS)](https://www.naturalsciences.be), with financial support from the [Belgian Science Policy Office](https://www.belspo.be) (`BelSPO valorisation project CROW`).

The application can be cited as:

> Noé N, Reyniers M, Van Hoey S, Desmet P (2021) CROW - Online tool to visualize birds detected by weather radars. <http://doi.org/10.5281/zenodo.4629449>

## Running installations

- [Demo](https://inbo.github.io/crow/)
- [Meteo.be](https://www.meteo.be/birddetection/)

## Installation and deployment

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

Build with:

```
npm run build
```

There is no need to build manually, as this is done automatically by GitHub Actions for every commit pushed to the `main` branch. It will serve the site at <https://inbo.github.io/crow/>.

If the app is to be deployed under a URL prefix (for example `https://inbo.github.io/crow`), create a `env.local` file in the source tree root with content: `URL_PREFIX = "/crow/"`.

## Architecture and data flow

See [src/README.md](src/README.md).

## License

[MIT License](LICENSE)
