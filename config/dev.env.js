'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  // HW_DEVICE_URL: '"http://192.168.0.196/"',
  CLOUD_URL: '"https://dev.thingjs.io:8083/"',
  HW_DEVICE_URL: '"http://192.168.8.107/"',
  //HW_DEVICE_URL: '"http://192.168.4.1/"',
  npm_config_report: 'true'
})
