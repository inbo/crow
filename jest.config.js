// This used to be a one-line preset from @vue/cli-plugin-unit-jest. That plugin's
// final release peers on jest 27, which transitively pins ts-jest to a version
// requiring TypeScript < 5, and @types/d3 7 needs TypeScript >= 5.1. The two
// cannot coexist, so jest is configured directly here and the whole jest chain
// moved to 29. This inlines what the preset used to provide.
// Pin the time zone the tests run in. It must be set here, before Jest starts its
// workers: each test file gets its own copy of process.env, so setting TZ in a
// spec has no effect on Date. d3 time axes and moment's local time follow it.
// A TZ given explicitly is kept (npm run test:unit uses that for the A6 tests).
if (!process.env.TZ) process.env.TZ = "Europe/Brussels";

module.exports = {
  testEnvironment: "jsdom",

  moduleFileExtensions: ["js", "jsx", "json", "vue", "ts", "tsx"],

  transform: {
    "^.+\\.vue$": "@vue/vue2-jest",
    // diagnostics are off because src/store/index.ts and the store modules import
    // each other; a whole-program tsc resolves that cycle, but ts-jest's per-file
    // language service does not and misreports the @Module decorator. Nothing is
    // lost: `npm run build` type checks the whole project, test files included.
    "^.+\\.tsx?$": ["ts-jest", { babelConfig: true, diagnostics: false }],
    "^.+\\.jsx?$": "babel-jest",
    ".+\\.(css|styl|less|sass|scss|jpg|jpeg|png|svg|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|avif)$":
      "jest-transform-stub"
  },

  // d3 v7 and its dependencies ship as ES modules only, which Jest cannot
  // require() directly. Let babel transform them instead of ignoring them.
  transformIgnorePatterns: [
    "/node_modules/(?!(d3|d3-[a-z0-9-]+|internmap|delaunator|robust-predicates)/)"
  ],

  // support the same @ -> src alias mapping as the application code
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },

  testMatch: [
    "**/tests/unit/**/*.spec.[jt]s?(x)",
    "**/__tests__/*.[jt]s?(x)"
  ]
}
