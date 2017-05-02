var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  context: __dirname + "/src",

  entry: {
    javascript: "./index.js",
    html: "./display.html",
  },

  output: {
    filename: "app.js",
    path: __dirname + "/build"
  },

  resolve: {
    extensions: ['', '.js', '.json']
  },

  plugins: [
    new CopyWebpackPlugin([ { from: __dirname + "/assets", to: "assets" } ])
  ],

  module: {
    loaders: [
      {
        test: /\.html$/,
        loader: "file?name=[name].[ext]",
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ["babel-loader"]
      }
    ]
  },

  devtool: 'source-map'
};
