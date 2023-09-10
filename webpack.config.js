'use strict'
const autoprefixer = require('autoprefixer')
const HtmlWebpackPlugin = require("html-webpack-plugin");
const miniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

module.exports = {
  entry: "./src/js/index.js",
  output: {
    filename: "script.min.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(scss)$/,
        use: [
          {
            // Adds CSS to the DOM by injecting a `<style>` tag
            loader: miniCssExtractPlugin.loader
          },
          {
            // Interprets `@import` and `url()` like `import/require()` and will resolve them
            loader: 'css-loader'
          },
          {
            // Loader for webpack to process CSS with PostCSS
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  autoprefixer
                ]
              }
            }
          },
          {
            // Loads a SASS/SCSS file and compiles it to CSS
            loader: 'sass-loader'
          }
        ]
      }
     ,{
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
        loader: "babel-loader",
      },
      }
    ],
  },

  plugins: [
    new miniCssExtractPlugin({ filename: "style.min.css" }),
    new HtmlWebpackPlugin({ template: './src/index.html',filename: 'index.html'})

], devServer: {
  proxy: {
    "/api": "http://localhost:3000", // Rota do JSON Server
    
  },
  static: {
      directory: path.resolve(__dirname, 'dist'),
    },
},
};
