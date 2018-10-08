const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


const APPDIR = path.resolve('src');
const BUILDDIR = path.resolve('build');

const TSLOADER = {
  test: /.tsx?$/,
  use: { loader: 'ts-loader' }
}

module.exports = {
  entry: {
    tetronMain: path.join(APPDIR, 'main/main.ts'),
    tetronRenderer: path.join(APPDIR, 'views/index.tsx')
  },
  output: {
    path: BUILDDIR,
    filename: '[name].js'
  },
  target: 'electron-main',
  mode: process.env.NODE_ENV || 'production',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },
  module: {
    rules: [ TSLOADER ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(APPDIR, 'views/index.html'),
      chunks: ['tetronRenderer']
    })
  ],
  node: {
    __dirname: false,
    __filename: false
  }
}