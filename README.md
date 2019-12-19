# Crow

Crow prototype, as a Vue.js SPA. Make uses of the [Vue CLI](https://cli.vuejs.org/) toolkit, [D3](https://d3js.org/) and [BootstrapVue](https://bootstrap-vue.js.org/).

## To run (development)

```
$ npm run serve
```

## To deploy

On [https://inbo.github.io/crow/](https://inbo.github.io/crow/)

```
$ rm -rf ./docs
$ npm run build
$ mv ./dist ./docs
```

Then commit and push, including the `docs` directory. GitHub pages does the rest. 