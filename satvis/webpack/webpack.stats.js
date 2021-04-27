const merge = require("webpack-merge");
const common = require("./webpack.prod.js");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
// 优化项目编译时的日志，默认为全部输出。优化项目加载性能
module.exports = merge(common, {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
});
