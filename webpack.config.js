var path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/Spatial.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'perun-spatial.min.js'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            cacheDirectory: true
          }
        }
      }
    ]
  }
};