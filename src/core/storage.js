import Axios from 'axios';
import Apps from './applications';
import consts from "consts";

export default {
    state: {
        guid : null,                            //GUID of the node
        is_net_pending: false,                  //Axios requests in pending
        user: {
            first_enter: true                   //True if first enter user on controller
        },
        system: {
            firmware_v: null,                   //Current firmware
            build_moment: null,                 //Moment was firmware built
            build_commit: null,                 //Current git commit of the platform
        },
        display: {
            lang: "en",                         //Lang interface
            theme: "dark",                      //Interface theme
            is_mobile: false,                   //Is mobile device
        },
        net: {
            ap_ssid: null,                      //SSID of own access point
            ap_password: null,                  //Password of own access point
            sta_ssid: null,                     //SSID for connect access point
            sta_password: null,                 //Password for connect access point
            ap_available: [],                   //Available access points list
            is_reloading_ap_list: false,        //Is processing reloading acess points list
            client_ip: '0.0.0.0',               //Own IP
            internet_status: 'DISCONNECTED',    //Internet connection status
            sync_with_ntp: true,                //If true controller will try get time from NTP server
        },
        datetime: {
            hw_datetime: null,                  //Original time from controller
            sync_datetime: null,                //Moment when hw_date was received
            curr_datetime: null,                //Visible date and time
            time_zone_offset: null              //Timezone
        },
        apps: {
            manifest: null                      //Manifest of applications
        },
        hardware: {
            profile: null                       //Profiles of hardware
        }
    },

    mutations: {
        //Set client IP (when connected to access point)
        setGUID(state, value) {
            state.guid = value;
        },

        //Set manifest of applications
        setApplicationsManifest(state, manifest) {
            for(let appid in manifest) {
                let app_manifest = manifest[appid];
                if ('storage' in app_manifest && 'objects' in app_manifest.storage) {
                    let object_struct = require('./storage-object');
                    object_struct.state.$namespace = app_manifest.name;
                    for(let object in app_manifest.storage.objects)
                        object_struct.state[object] = null;

                    if(!(app_manifest.name in state))
                        this.registerModule(app_manifest.name, require('./storage-collector'));

                    this.registerModule([app_manifest.name, 'data'], object_struct);

                    for(let object in app_manifest.storage.objects) {
                        if(app_manifest.storage.objects[object].preload)
                            this.dispatch(`${app_manifest.name}/data/reload`, object);
                    }
                }
                if ('components' in app_manifest)
                    for (let cname in app_manifest.components) {
                        if (!(cname in Vue.options.components)) {
                            console.log('Register component ', cname);
                            if(process.env.NODE_ENV === 'production')
                                Vue.component(cname, Apps.makePromisLoadComponent(`/apps/${appid}/${app_manifest.components[cname].source}`, cname));
                            else
                                Vue.component(cname, Apps.makePromisLoadComponent(app_manifest.components[cname].source, cname));
                        }
                    }
            };
            state.apps.manifest = manifest;
        },

        //Set profile of hardware
        setHardwareProfile(state, profile) {
            state.hardware.profile = profile;
        },

        //Set flag of synchronize with NTP server
        setSyncWithNTP(state, value) {
            state.net.sync_with_ntp = value;
        },

        //Set Internet status
        setInternetStatus(state, value) {
            state.net.internet_status = value;
        },

        //Set client IP (when connected to access point)
        setIP(state, value) {
            state.net.client_ip = value;
        },

        //Set own access point name
        setAPSSID(state, value) {
            state.net.ap_ssid = value;
        },

        //Set access point for connection
        setSTASSID(state, value) {
            state.net.sta_ssid = value;
        },

        setIsNetPending(state, pending) {
            state.is_net_pending = pending;
        },

        //Flag of mobile device
        setIsMobile(state, value) {
            state.display.is_mobile = value;
        },

        //Set firmware build commit
        setBuildCommit(state, value) {
            state.system.build_commit = value;
        },

        //Set firmware build moment
        setBuildMoment(state, value) {
            state.system.build_moment = value;
        },

        //Set firmware version
        setFirmwareVersion(state, value) {
            state.system.firmware_v = value;
        },

        //Set flag of reloading process
        setReloadingAPList(state, value) {
            state.net.is_reloading_ap_list = value;
        },

        //Set theme
        setUserFirstEnter(state, value) {
            state.user.first_enter = value;
        },

        //Set theme
        setLang(state, lang) {
            state.display.lang = lang;
        },

        //Set ip
        setClientIP(state, ip) {
            state.net.client_ip = ip;
        },

        //Set theme
        setTheme(state, theme) {
            state.display.theme = theme;
        },

        //Set available access points
        setAPAvailable(state, list) {
            state.net.ap_available = list;
        },

        //Set time (only for storage)
        setTime(state, time) {
            state.datetime.hw_datetime = time;
            state.datetime.sync_datetime = (new Date).getTime();
            state.datetime.curr_datetime = time;
        },

        //Set timezone offset
        setTimezoneOffset(state, offset) {
            state.datetime.time_zone_offset = offset;
        },

        //Update current hardware time after recalculation
        updateCurrentTime(state, time) {
            state.datetime.curr_datetime = time;
        },

    },

    actions: {
        //Put configuration to controller
        putConfiguration(context, config) {
            window.$axios._addPendingRequest(consts.REST.CONFIG);
            Axios.put(consts.REST.CONFIG, config).then((response) => {
                window.$axios._removePendingRequest(consts.REST.CONFIG);

                context.dispatch('applyState', response.data);

                if ('success' in config)
                    config['success'](config, this);

                this.$bus.$emit(consts.EVENTS.PUT_CONFIG_SUCCESS);
            }).catch(() => {
                window.$axios._removePendingRequest(consts.REST.CONFIG);

                if ('error' in config)
                    config['error'](config, this);

                this.$bus.$emit(consts.EVENTS.PUT_CONFIG_ERROR);
                this.$bus.$emit(consts.EVENTS.ALERT, consts.ALERT_TYPE.ERROR, Vue.filter('lang')('NETWORK_ERROR'));
            });
        },

        //Reload available access point list
        refreshAccessPointsList(context) {

            if (context.state.net.is_reloading_ap_list)
                return;

            context.commit('setReloadingAPList', true);
            window.$axios._addPendingRequest(consts.REST.AP_AVAILABLE);

            Axios.get(consts.REST.AP_AVAILABLE).then((response) => {
                window.$axios._removePendingRequest(consts.REST.AP_AVAILABLE);
                context.commit('setAPAvailable', response.data);
                context.commit('setReloadingAPList', false);
            }).catch(function () {
                window.$axios._removePendingRequest(consts.REST.AP_AVAILABLE);
                context.commit('setReloadingAPList', false);
            });

        },

        //Apply new manifest of applications
        applyApplicationsManifest(context, manifest) {
            context.commit('setApplicationsManifest', manifest);
        },

        //Apply new profile of hardware
        applyHardwareProfile(context, manifest) {
            context.commit('setHardwareProfile', manifest);
        },

        //Apply new control state to store
        applyState(context, state) {
            try {
                context.commit('setTime', +state.time.current);
                context.commit('setTimezoneOffset', state.time.offset);
                context.commit('setAPAvailable', state.net.ap_list);
                context.commit('setClientIP', state.net.client_ip);

                if (state.display.theme && state.display.theme.length)
                    context.commit('setTheme', state.display.theme);

                if (state.display.lang && state.display.lang.length)
                    context.commit('setLang', state.display.lang);

                context.commit('setUserFirstEnter', !!state.user.first_enter);

                context.commit('setAPSSID', state.net.ap_ssid);
                context.commit('setSTASSID', state.net.sta_ssid);
                context.commit('setInternetStatus', state.net.internet_status);
                context.commit('setIP', state.net.client_ip);
                context.commit('setSyncWithNTP', !!state.net.sync_with_ntp);

                context.commit('setFirmwareVersion', state.system.firmware);
                context.commit('setBuildCommit', state.system.build_commit);
                context.commit('setBuildMoment', state.system.build_moment);

                console.info('Firmware ', state.system.firmware, ' commit ', state.system.build_commit, ' moment ', state.system.build_moment);
            } catch (e) {
                this.$bus.$emit(consts.EVENTS.ALERT, consts.ALERT_TYPE.ERROR, Vue.filter('lang')('STATE_ERROR'));
                console.error(e);
            }
        },

        //Reload manifest of applications
        reloadApplicationsManifest(context) {
            window.$axios._addPendingRequest(consts.REST.MANIFEST);
            Axios.get(consts.REST.MANIFEST).then((response) => {
                window.$axios._removePendingRequest(consts.REST.MANIFEST);
                context.dispatch('applyApplicationsManifest', response.data);
                context.dispatch('reloadState');
            }).catch(function (e) {
                window.$axios._removePendingRequest(consts.REST.MANIFEST);
                console.error('Error of loading manifest', e);
            });
        },

        //Reload profile of hardware
        reloadHardwareProfile(context) {
            window.$axios._addPendingRequest(consts.REST.PROFILE);
            Axios.get(consts.REST.PROFILE).then((response) => {
                window.$axios._removePendingRequest(consts.REST.PROFILE);
                context.dispatch('applyHardwareProfile', response.data);
            }).catch(function (e) {
                window.$axios._removePendingRequest(consts.REST.PROFILE);
                console.error('Error of loading profile', e);
            });
        },
        
        //Reload available access point list
        reloadState(context) {
            window.$axios._addPendingRequest(consts.REST.STATE);

            Axios.get(consts.REST.STATE).then((response) => {
                window.$axios._removePendingRequest(consts.REST.STATE);
                context.dispatch('applyState', response.data);
            }).catch(function () {
                window.$axios._removePendingRequest(consts.REST.STATE);
            });
        },

        //Initiation function
        initData(context) {
            [
                {id : "lang", "commit": "setLang"},
                {id : "theme", "commit": "setTheme"}
            ].map((item) => {
                let matches = document.cookie.match(new RegExp(
                    "(?:^|; )" + `__${item.id}`.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
                ));
                if(matches)
                    context.commit(item.commit, decodeURIComponent(matches[1]));
            });

            setInterval(()=>{
                let nex_status = window.$axios._isPendingRequest();
                if(context.state.is_net_pending !== nex_status)
                    context.commit('setIsNetPending', nex_status);
            }, 200);

            //Settinf UBUS address
            context.commit('setGUID', 'xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            }));

            //Autodetect language
            context.commit('setLang', (navigator.language || navigator.userLanguage).toLowerCase());

            //Loading available access points
            this.$bus.$on(consts.EVENTS.UBUS_MESSAGE, (action, content) => {
                switch(action) {
                    case consts.UBUS.CURRENT_TIME :
                        context.commit('setTime', +content);
                        break;
                    case consts.UBUS.IS_ONLINE :
                        context.commit('setInternetStatus', 'CONNECTED');
                        context.commit('setIP', content);
                        break;
                    case consts.UBUS.IS_OFFLINE :
                        context.commit('setInternetStatus', 'DISCONNECTED');
                        context.commit('setIP', '0.0.0.0');
                        break;
                }
            });

            //Loading available access points
            this.$bus.$on(consts.EVENTS.CORE_IS_LOADED, (messages) => {
                //Init current time refresher
                if (!('hwDateTimeTimer' in window)) {
                    window.hwDateTimeTimer = setInterval(function () {
                        context.commit('updateCurrentTime', (new Date).getTime()
                            - context.state.datetime.sync_datetime
                            + context.state.datetime.hw_datetime
                        );
                    }, 1000);
                }
                context.dispatch('reloadApplicationsManifest');
                context.dispatch('reloadHardwareProfile');
                window.$axios._removePendingRequest(consts.EVENTS.CORE_IS_LOADED);
            });

        },

    }

}