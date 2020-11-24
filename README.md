# Crow

Crow is a single-page application to visualize bird migration as detected by weather radars. Makes use of the [Vue CLI](https://cli.vuejs.org/) toolkit, [D3](https://d3js.org/) and [BootstrapVue](https://bootstrap-vue.js.org/).

## Installation and development

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

## Deployment

```
npm run build
```

Then commit and push, including the `docs` directory. GitHub pages will serve the site at <https://inbo.github.io/crow/>.

Next step: 

- Mutations in constants
- Improve imports: understand @, look for unused imports, make style consistent, ...
- selectedDate in store: also move there related mutations, getters, ... Also convert selectedDate to something better than a string?