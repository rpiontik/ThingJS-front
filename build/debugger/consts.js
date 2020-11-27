export default {
    WEBSOCKET : {
        RECONNECT_TIMEOUT : 5000,
    },
    EVENTS : {
        WS_STARTING : 'ws-starting',
        WS_STARTED : 'ws-started',
        WS_MESSAGE_FROM : 'ws-message-from',
        WS_MESSAGE_TO : 'ws-message-to',
        WS_ERROR : 'ws-error',
        WS_CLOSED : 'ws-closed',
        WS_TIMEOUT : 'ws-timeout',
        WS_RECOVERED : 'ws-recovered',
        ALERT: 'alert',
    },
    DEBUGGER_EVENT : {
        DEBUGGER_DETECTED : 'dbgr-debugger',
        DEBUGGER_WAITING : 'dbgr-waiting',
        DEBUGGER_EXECUTING : 'dbgr-executing',
        DEBUGGER_UNKNOWN : 'dbgr-unknown',
        DEBUGGER_ON_ERROR : 'dbgr-error',
        MANIFEST_CHANGED : 'dbgr-manifest-changed',
        DEBUGGER_EXPR_RES : 'dbgr-expr-res',
        DEBUGGER_LASTERROR : 'dbgr-lasterror',
        DEBUGGER_OBJECT_PATCHED: 'dbgr-object-patched'
    },
    WS_ACTIONS : {
        TAKEN : '$taken',
        HELLO : '$hello',
        GET_STATE : 'get-state',
        STEP_INTO : 'step-into',
        STEP_OVER : 'step-over',
        STEP_OUT : 'step-out',
        STEP_RUN : 'step-run',
        STEP_STOP : 'step-stop',
        LAST_ERROR : 'lasterror',
        STDERR : 'stderr',
        STDOUT : 'stdout',
    },
    ALERT_TYPE :{
        ERROR : 'error',
        SUCCESS : 'success',
        INFO : 'info',
        WARNING : 'warning',
    },
    REST : {
        STATE : "/api/state",
        MANIFEST : "/manifest",
        PROFILE : "/profile",
        CONFIG : "/api/config",
        AP_AVAILABLE : "/api/rescan_net",
        TIME : "/api/time"
    },
}