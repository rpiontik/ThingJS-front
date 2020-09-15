import Axios from 'axios';
import consts from "./consts";

export default {
    state: {
        token : false,          //Marker that controller is token for other debugger
        connected : false,      //Is debugger connected to controller?
        url : null,             //Controller address
        manifest : {},          //Controller manifest
        pending : 0,            //Pending counter. For example - reloading process
        event_queue : [],       //Queue accumulates events from debugger in time reloading
        consolelog : [],        //Console log {type: [stdout/stderr], text: [text], app: [application]}
        exec_state : {},        //Current state of execution
        watch_list : [],        //Watch expressions
    },

    mutations: {

        //Remove expression from watching
        clearWatchExpressionResult(state, id) {
            state.watch_list[id].result = null;
            Vue.set(state, 'watch_list', [...state.watch_list]);
        },

        //Remove expression from watching
        updateWatchExpressionResult(state, data) {
            state.watch_list[data.id].result = data.result;
            Vue.set(state, 'watch_list', [...state.watch_list]);
        },

        //Remove expression from watching
        updateWatchExpression(state, data) {
            if(state.watch_list[data.id].expression !== data.expression) {
                state.watch_list[data.id].expression = data.expression;
                state.watch_list[data.id].result = null;
                this.dispatch('recalcWatchExpression', data.id);
            }
        },

        //Append expression for watching
        appendWatchExpression(state, data) {
            state.watch_list.push({
                app : data.app,
                expression : data.expression,
            });
            this.dispatch('recalcWatchExpression', state.watch_list.length - 1);
        },

        //Remove expression from watching
        removeWatchExpression(state, index) {
            state.watch_list.splice(index, 1);
        },

        //Update state of execution
        updateState(state, data){
            for(let app in data)
                state.exec_state[app] = Object.assign(state.exec_state[app] ? state.exec_state[app] : {}, data[app]);
            state.exec_state = Object.assign({}, state.exec_state);
        },

        //Append text to console log
        appendToConsoleLog(state, item) {
            state.consolelog.push(item);
        },

        //Appent text to console log
        clearConsoleLog(state, item) {
            state.consolelog = [];
        },

        //Start pending transaction
        beginPending(state) {
            state.pending++;
        },

        //End pending transaction
        endPending(state) {
            if(state.pending > 0)
                state.pending--;
        },

        //Push event to queue
        pushEventToQueue(state, event){
            state.event_queue.push(event);
        },

        //Pop event from queue
        clearEventToQueue(state){
            state.event_queue = [];
        },

        //Set controller url
        setUrl(state, url) {
            if(state.url !==url) {
                state.url = url;
                this.dispatch('fullReload');
            }
        },
        //Set manifest of applications
        setApplicationsManifest(state, manifest) {
            state.manifest = manifest;
        },
        //Set connected status
        setConnected(state, is_connected) {
            state.connected = is_connected;
        },
        //Set taken status
        setToken(state, is_token) {
            state.token = is_token;
        },
    },

    actions: {
        //Recalculate expression for application
        recalcExpressionsForApp(context, appname){
            context.state.watch_list.map((item, id) => {
                if(item.app == appname) {
                    this.commit('clearWatchExpressionResult', id);
                    item.result = null;
                    this.dispatch('recalcWatchExpression', id);
                }
            });
        },

        //Recalculation expression by id
        recalcWatchExpression(context, id) {
            this.$bus.$emit(consts.EVENTS.WS_MESSAGE_TO, {
                id,
                action : 'watch-expr',
                expr : context.state.watch_list[id].expression,
                app : context.state.watch_list[id].app
            });
        },

        //Push event to queue
        beginPending(context){
            context.commit('beginPending');
        },

        //Push event to queue
        endPending(context){
            context.commit('endPending');
            if(!context.state.pending)
                context.state.event_queue.map((message) => {
                    context.dispatch('processingEvent', message);
                });
        },

        //Reload manifest of applications
        reloadApplicationsManifest(context) {
            context.dispatch('beginPending');
            Axios.get(context.state.url + consts.REST.MANIFEST, {cache: false}).then((response) => {
                context.commit('setApplicationsManifest', response.data);
                context.dispatch('endPending');
            }).catch(function (e) {
                console.error('Error of loading manifest', e);
                this.$bus.$emit(consts.EVENTS.ALERT, consts.ALERT_TYPE.ERROR, 'Error of loading manifest');
                context.dispatch('endPending');
            });
        },
        
        //Full reload 
        fullReload(context) {
            context.dispatch('reloadApplicationsManifest');
        },

        processingEvent(context, message) {
            this.$bus.$emit(`dbgr-${message.action}`, message);
        },

        //Initialize storage
        init(context) {
            this.$bus.$on(consts.DEBUGGER_EVENT.DEBUGGER_EXPR_RES, (message) => {
                this.commit('updateWatchExpressionResult',{
                    id : message.id,
                    result : message.res
                });
            });

            this.$bus.$on(consts.DEBUGGER_EVENT.DEBUGGER_EXECUTING, (message) => {
                context.commit('updateState', {
                    [message.app] : {}
                });
            });

            this.$bus.$on(consts.DEBUGGER_EVENT.MANIFEST_CHANGED, () => {
                context.dispatch('reloadApplicationsManifest');
            });

            this.$bus.$on([
                consts.DEBUGGER_EVENT.DEBUGGER_DETECTED,
                consts.DEBUGGER_EVENT.DEBUGGER_ON_ERROR,
                consts.DEBUGGER_EVENT.DEBUGGER_WAITING
            ], (message) => {
                context.commit('updateState', {
                    [message.app] : {
                        last_error: null,
                        [message.source.split('.')[0]] : {
                            line : message.line,
                            event_type : `dbgr-${message.action}`
                        }
                    }
                });
                this.dispatch('recalcExpressionsForApp', message.app);
                if(message.action === 'error') {
                    this.$bus.$emit(consts.EVENTS.WS_MESSAGE_TO, {
                        action : consts.WS_ACTIONS.LAST_ERROR,
                        app : message.app
                    });
                }
            });

            this.$bus.$on([
                consts.DEBUGGER_EVENT.DEBUGGER_LASTERROR
            ], (message) => {
                context.commit('updateState', {
                    [message.app]: {
                        last_error: message.err
                    }
                });
            });

            this.$bus.$on([consts.EVENTS.WS_CLOSED, consts.EVENTS.WS_TIMEOUT], () => {
                context.commit('setConnected', false);
            });
            this.$bus.$on(consts.EVENTS.WS_RECOVERED, () => {
                context.commit('setConnected', true);
                this.$bus.$emit(consts.EVENTS.WS_MESSAGE_TO, {action : consts.WS_ACTIONS.GET_STATE});
            });
            this.$bus.$on(consts.EVENTS.WS_MESSAGE_FROM, (message) => {
                switch(message.action) {
                    case consts.WS_ACTIONS.STDOUT :
                    case consts.WS_ACTIONS.STDERR : {
                        context.commit('appendToConsoleLog', {
                            type : message.action,
                            text : message.text,
                            app : message.app
                        });
                    } break;
                    case consts.WS_ACTIONS.TAKEN : {
                        context.commit('setConnected', false);
                        context.commit('setToken', true);
                    } break;
                    case consts.WS_ACTIONS.HELLO : {
                        context.commit('setConnected', true);
                        context.commit('setToken', false);
                        this.$bus.$emit(consts.EVENTS.WS_MESSAGE_TO, {action : consts.WS_ACTIONS.GET_STATE});
                    } break;
                    default:
                        if(context.state.pending)
                            context.commit('pushEventToQueue', message);
                        else
                            context.dispatch('processingEvent', message);
                }
            });
        }
    }

}