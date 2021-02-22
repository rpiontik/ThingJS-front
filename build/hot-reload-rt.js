'use strict'
const Axios = require('axios')
const crc32 = require('./crc32')

const RETRY_INTERVAL = 3000

module.exports = {
  timers: {},
  items: {},
  clearTimers () {
  },
  appendItem (target) {
    if (!this.items[target.app]) {
      this.items[target.app] = {}
    }
    if (!(target.type in this.items[target.app])) {
      this.items[target.app][target.type] = {
        timer: null,
        handle: this[`upload_${target.type}`].bind(this),
        objects: {}
      }
    }

    let objects = this.items[target.app][target.type].objects

    let object_ = objects[target.object] =
      objects[target.object] ? objects[target.object] : {crc: null}

    object_.target = Object.assign(target, {crc: (this[`crc_${target.type}`])(target)})
  },

  upload_mjs (app_name, objects) {
    // If cloud then turn off hot reload
    if (window.location.hostname.slice(-10).toLowerCase() === 'thingjs.io')
      return;

    let timer_id = `${app_name}_mjs`
    let url = `${process.env.HW_DEVICE_URL}apps/${app_name}/`

    if (this.timers[timer_id]) {
      clearTimeout(this.timers[timer_id])
      this.timers[timer_id] = null
    }

    let formData = new FormData()
    objects.map((object_) => formData.append(
      object_.target.object,
      new Blob([object_.target.source]), `${object_.target.object}.mjs`
    ))

    Axios.patch(url, formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    ).then(() => {
      this.timers[timer_id] = null
      objects.map((object_) => {
        object_.crc = object_.target.crc
        console.info(`Script is reloaded on controller [${app_name}/${object_.target.object}.mjs]`)
      })
    }).catch((e) => {
      if (!e.response) {
        console.info(`No available device. Retrying hot reload ${url} after ${RETRY_INTERVAL}ms...`)
        this.timers[timer_id] =
          setTimeout(() => this.upload_mjs(app_name, objects), RETRY_INTERVAL)
      } else {
        console.error(`HOT RELOAD ERROR FOR ${url}`, e)
      }
    })
  },

  crc_mjs (target) {
    return crc32.calcByBinary(new TextEncoder('utf-8').encode(target.source))
  },

  doReload () {
    for (let app_name in this.items) {
      for (let type_ in this.items[app_name]) {
        let objects_ = this.items[app_name][type_].objects
        let for_reload = []
        for (let object_ in objects_) {
          if (objects_[object_].crc != objects_[object_].target.crc) {
            for_reload.push(objects_[object_])
          }
        }
        if (for_reload.length > 0) {
          this.items[app_name][type_].handle(app_name, for_reload);
        }
      }
    }
  }
}
