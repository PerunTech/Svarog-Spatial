let path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/Spatial.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'perun-spatial.min.js',
    library: 'perun-spatial',
    libraryTarget: 'this',
    libraryExport: 'default'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)?$/, 
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            cacheDirectory: true
          }
        }
      },
      {
        // For pure CSS (without CSS modules)
        test: /\.css$/i,
        exclude: /\.module\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        // For CSS modules
        test: /\.module\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
        ],
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  externals: [
    {
      "prop-types": "prop-types",
      "react": "react",
      "react-dom": "react-dom",
      "react-redux": "react-redux",
      "redux": "redux"
    }
  ]
};