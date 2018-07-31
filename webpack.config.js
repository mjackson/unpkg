const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: {
    main: path.resolve(__dirname, "./modules/client/main.js"),
    autoIndex: path.resolve(__dirname, "./modules/client/autoIndex.js")
  },

  externals: {
    react: "React",
    "react-dom": "ReactDOM",
    "react-router-dom": "ReactRouterDOM"
  },

  output: {
    filename: "[name]-[hash:8].js",
    path: path.resolve(__dirname, "public/_assets"),
    publicPath: "/_assets/"
  },

  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: "babel-loader" },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      },
      { test: /\.md$/, use: ["html-loader", "markdown-loader"] },
      { test: /\.png$/, use: "file-loader" }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development"
      )
    }),
    new ExtractTextPlugin("[name]-[hash:8].css")
  ],

  devtool:
    process.env.NODE_ENV === "production" ? false : "cheap-module-source-map"
};
