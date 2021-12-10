'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

const config = merge(common, {
  entry: {
    contentScript: PATHS.src + '/contentScript.js',
  },
});

module.exports = config;
