const webpack = require("webpack");

let commitHash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString();

module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? '/crow/' : '/',
    
    configureWebpack: {
      plugins: [
        new webpack.DefinePlugin({
          __COMMIT_HASH__: JSON.stringify(commitHash),
        })
      ]
    }
  }