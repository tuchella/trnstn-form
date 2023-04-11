const buildPlugin = require('./build-php.js').build;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const ArbitraryCodeAfterReload = function(cb) {
  this.apply = function(compiler) {
    if (compiler.hooks && compiler.hooks.done) {
      compiler.hooks.done.tap('webpack-arbitrary-code', cb);
    }
  };
};

const plugins = [];

if (process.env.NODE_ENV === 'development') {
  plugins.push(new ArbitraryCodeAfterReload(buildPlugin));
  //plugins.push(new BundleAnalyzerPlugin());
}

module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  publicPath: process.env.NODE_ENV === 'production' ? '/form' : '/form',
  configureWebpack: {
    plugins
  }
}
