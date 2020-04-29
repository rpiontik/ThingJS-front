'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  //HW_DEVICE_URL: '"http://192.168.212.128"'
  HW_DEVICE_URL: '"http://192.168.8.106"',
  //HW_DEVICE_URL: '"http://192.168.4.1"',
})
