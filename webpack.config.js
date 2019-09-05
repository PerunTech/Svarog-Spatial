var path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/Spatial.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'perun-spatial.min.js'
  }
};