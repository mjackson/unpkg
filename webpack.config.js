const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: {
    main: path.resolve(__dirname, "client/main.js")
  },

  output: {
    filename: "[name]-[hash:8].js",
    path: path.resolve(__dirname, "public/_assets"),
    publicPath: "/_assets/"
  },

  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: ["babel-loader"] },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      { test: /\.md$/, use: ["html-loader", "markdown-loader"] },
      { test: /\.png$/, use: ["file-loader"] }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development"
      )
    })
  ],

  devtool:
    process.env.NODE_ENV === "production" ? false : "cheap-module-source-map"
};
