const path = require("path")
const webpack = require("webpack")
const HTMLWebpackPlugin = require("html-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = {
  devtool: process.env.NODE_ENV === "production" ? false : "cheap-module-source-map",

  entry: {
    client: path.resolve(__dirname, "client/index.js")
  },

  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name]-[hash:8].js"
  },

  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: ["babel-loader"] },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      { test: /\.md$/, use: ["html-loader", "markdown-loader"] },
      { test: /\.png/, use: ["file-loader"] }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development")
    }),
    new HTMLWebpackPlugin({
      title: "unpkg",
      chunks: ["client"],
      template: path.resolve(__dirname, "client/index.html")
    }),
    new CopyWebpackPlugin(["public"])
  ],

  devServer: {
    proxy: {
      "**": {
        target: "http://localhost:8081",
        bypass: req => {
          if (req.path === "/") {
            return "/"
          }
        }
      }
    }
  }
}
