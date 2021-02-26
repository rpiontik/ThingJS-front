'use strict'
module.exports = {
  NODE_ENV: '"production"',
  BUILD_MOMENT : '"' + (new Date()).toLocaleString() + '"',
  // todo НУЖНО РАСКОММЕНТИРОВАТЬ!!
  // CLOUD_URL: '"https://thingjs.io/"'
  CLOUD_URL: '"https://dev.thingjs.io:8083/"'
}
