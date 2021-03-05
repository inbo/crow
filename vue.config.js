// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require("webpack");

const commitHash = require("child_process")
  .execSync("git rev-parse --short HEAD")
  .toString();

module.exports = {
  publicPath: process.env.URL_PREFIX,
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __COMMIT_HASH__: JSON.stringify(commitHash),
      })
    ]
  },
  outputDir: "docs",
}
