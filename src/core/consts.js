export default {
  WEBSOCKET: {
    ADDRESS: 'ws://192.168.1.96:8080',
    RECONNECT_TIMEOUT: 5000,
    DISTRIB_MESSAGE_INTERNAL: 'internal',
  },
  UBUS: {
    CURRENT_TIME: '$-current-time',
    IS_ONLINE: '$-online',
    IS_OFFLINE: '$-offline',
    SCRIPT_ERROR: '$-script-error',
    DEBUGGER_REQUEST: '$-debugger-request'
  },
  EVENTS: {
    CORE_IS_LOADED: 'core-loaded',
    LAUNCHER_IS_LOADED: 'launcher-loaded',
    DO_SCREEN_REBUILD: 'do-screen-rebuild',
    PUT_CONFIG_ERROR: 'put-config-error',
    PUT_CONFIG_SUCCESS: 'put-config-success',
    ALERT: 'alert',
    WS_STARTING: 'ws-starting',
    WS_STARTED: 'ws-started',
    WS_ERROR: 'ws-error',
    WS_CLOSED: 'ws-closed',
    UBUS_MESSAGE: 'ubus-message',
    STORE_RELOADED: 'store-reloaded',
    STORE_ERROR_RELOADED: 'store-error-reloaded'
  },
  ALERT_TYPE: {
    ERROR: 'error',
    SUCCESS: 'success',
    INFO: 'info',
    WARNING: 'warning'
  },
  REST: {
    STATE: ('HW_DEVICE_URL' in process.env ? process.env.HW_DEVICE_URL : '') + '/api/state',
    // todo Нужно решить, что делать с манифестом приложений. Пока беру с локального сервера
    MANIFEST: /* ('HW_DEVICE_URL' in process.env ? process.env.HW_DEVICE_URL : '') + */'/manifest',
    PROFILE: ('HW_DEVICE_URL' in process.env ? process.env.HW_DEVICE_URL : '') + '/profile',
    CONFIG: ('HW_DEVICE_URL' in process.env ? process.env.HW_DEVICE_URL : '') + '/api/config',
    AP_AVAILABLE: ('HW_DEVICE_URL' in process.env ? process.env.HW_DEVICE_URL : '') + '/api/rescan_net',
    TIME: ('HW_DEVICE_URL' in process.env ? process.env.HW_DEVICE_URL : '') + '/api/time'
  },
  STORAGES: {
    STATUS_EMPTY: 'empty',
    STATUS_LOADING: 'loading',
    STATUS_POSTING: 'posting',
    STATUS_READY: 'ready'
  },
  LANGS: {}
}
