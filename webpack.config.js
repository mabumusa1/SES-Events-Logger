const { node } = require("webpack");

module.exports = {
  entry: './src/handlers/index.js',
  target: 'node',
  output: {
    filename: 'function.js',
    libraryTarget: 'umd'
  }
}
