<template>
    <div id="app">
        <v-style v-if="theme=='light'">
            body, html { background-color: #f5f5f5 !important; }
        </v-style>
        <v-style v-if="theme=='dark'">
            body, html { background-color: #212121 !important; }
        </v-style>
        <v-app id="inspire" :light="theme=='light'" :dark="theme=='dark'">
            <v-navigation-drawer id="mainmenu" clipped touchless fixed v-model="drawer" app>
                <v-list dense>
                    <router-link :to="{name:'Dashboard'}">
                        <v-list-tile>
                            <v-list-tile-action>
                                <v-icon>dashboard</v-icon>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title>{{'DASHBOARD' | lang}}</v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </router-link>
                    <router-link :to="{name:'Settings'}">
                        <v-list-tile>
                            <v-list-tile-action>
                                <v-icon>settings</v-icon>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title>{{'SETTINGS' | lang}}</v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </router-link>
                </v-list>
            </v-navigation-drawer>
            <v-toolbar app fixed clipped-left>
                <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
                <v-toolbar-title>ThingJS</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-icon v-if="currentApplication" @click="closeApplication" style="cursor: pointer">close</v-icon>
            </v-toolbar>
            <v-content>
                <router-view/>
            </v-content>
            <v-footer app fixed :style="isMobileScreen?{'display':'table-row'}:{}">
                <span class="status_label" :style="isMobileScreen?{'display':'table-cell'}:{}">
                    <template v-if="!isMobileScreen">{{ 'CURRENT_TIME' | lang }}:</template>
                    {{currentTime}}
                </span>
                <span class="status_label" :style="isMobileScreen?{'display':'table-cell'}:{}">
                    <template v-if="!isMobileScreen">{{ 'IP' | lang }}:</template>
                    {{this.$store.state.net.client_ip}}
                </span>
                <span class="status_label" :style="isMobileScreen?{'display':'table-cell'}:{}">
                    <template v-if="!isMobileScreen">{{ 'INTERNET' | lang }}:</template>
                    {{this.$store.state.net.internet_status | lang}}
                </span>
                <span v-if="!isMobileScreen" class="status_label">
                    {{ 'FIRMWARE' | lang }}: {{this.$store.state.system.firmware_v}}
                        [{{lang}}]
                </span>
                <span v-if="debuggerUrl" class="status_label debugger">
                    <a :href="debuggerUrl" target="_blank">{{ 'DEBUGGER' | lang }}</a>
                </span>
              <span v-if="cloudSwitcher!==null" >
                <v-checkbox
                    v-model="cloudSwitcher"
                    label="Cloud mode"
                ></v-checkbox>
              </span>
            </v-footer>

            <v-progress-linear
                    v-if="isNetPending"
                    style="position: fixed; top: 0; left: 0; right: 0; z-index: 1000; height: 5px; margin: 0px;"
                    :indeterminate="true">

            </v-progress-linear>

            <v-alert v-if="alerts.length"
                     :type="alerts[0].type"
                     :value="true"
                     transition="scale-transition"
                     style="position: fixed; right: 16px; top: 16px; width: 400px; max-width: 80%; z-index: 20000"
            >

                <v-layout row>
                    <v-flex v-html="alerts[0].message">
                    </v-flex>
                    <v-flex shrink>
                        <v-btn
                                flat
                                @click="alerts = alerts.slice(1)"
                                style="float: right; margin-left: 4px; margin-right: 0;margin-top: 0;"
                        >
                            {{'CLOSE' | lang }}
                        </v-btn>
                    </v-flex>
                </v-layout>
            </v-alert>

        </v-app>

    </div>
</template>

<script>
import ConfigHelper from './components/ConfigHelper.vue';
import Settings from './components/Settings.vue';
import Dashboard from './components/Dashboard.vue';
import CloudRegistration from './components/CloudRegistration';

export default {
    name: 'App',
    components: {
        'v-style': {
            render: function (createElement) {
                return createElement('style', this.$slots.default);
            }
        }
    },
    beforeCreate () {
        if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
            var ww = (document.documentElement.clientWidth < window.screen.width) ? document.documentElement.clientWidth : window.screen.width; // get proper width
            var mw = 400; // min width of site
            var ratio = ww / mw; // calculate ratio
            document.querySelector('meta[name=viewport]').setAttribute('content', 'initial-scale=' + ratio + ', user-scalable=yes, width=400');
        }

        this.$router.addRoutes([
            {
                path: '/config_helper',
                name: 'ConfigHelper',
                component: ConfigHelper
            },
            {
                path: '/settings',
                name: 'Settings',
                component: Settings
            },
            {
                path: '/dashboard',
                name: 'Dashboard',
                component: Dashboard
            },
            {
                path: '/',
                name: 'Root',
                component: Dashboard
            },
            {
                name: 'CloudRegistration',
                path: `/cloud/registration`,
                component: CloudRegistration
            }
        ]);

        this.$store.registerModule('$launcher', require('./storages/storage').default);
    },
    methods: {
        closeApplication () {
            // Close all active applications
            this.$store.dispatch('$launcher/closeCurrentApplication');
        }
    },
    mounted () {
        // Detect first enter
        if (this.$router.currentRoute.path === '/') {
            if (this.$store.state.user.first_enter) {
                this.$store.commit('setUserFirstEnter', false);
                this.$router.push('/config_helper');
            } else {
                this.$router.push('/dashboard');
            }
        }

        if (process.env.NODE_ENV !== 'production') {
            // Debugger starter
            this.$bus.$on($consts.EVENTS.UBUS_MESSAGE, (type, messages) => {
                if (type === $consts.UBUS.DEBUGGER_REQUEST) {
                    this.alerts.push({
                        type: $consts.ALERT_TYPE.WARNING,
                        message: Vue.filter('lang')('DETECTED_DEBUGGER_REQUEST')
                            .replace('%appname%', JSON.parse(messages).app)
                            .replace('%url%', this.debuggerUrl)
                    });
                }
            });
        }

        // Loading available access points
        this.$bus.$on($consts.EVENTS.ALERT, (type, messages) => {
            this.alerts.push({
                type: type,
                message: messages
            });
        });

        this.$bus.$on($consts.EVENTS.APP_IS_LOADED, (messages) => {
            setTimeout(() => {
                this.is_app_ready = true;
            }, 50);
        });
    },
    computed: {
        currentApplication () {
            return this.$store.state.$launcher.currentApplication;
        },
        debuggerUrl () {
            return process.env.NODE_ENV !== 'production' ? `/debugger.html?url=${process.env.HW_DEVICE_URL}` : null;
        },
        cloudSwitcher: {
            get () {
                return process.env.NODE_ENV === 'production' ? null : this.$store.state.is_cloud_mode;
            },
            set (value) {
                this.$store.dispatch('switchOnClodMode', value);
            }
        },
        theme () {
            let bgColor = this.$store.state.display.theme === 'light' ? '#f5f5f5' : '#212121';
            ['theme-color', 'msapplication-navbutton-color', 'apple-mobile-web-app-status-bar-style'].map((item) => {
                let meta = document.querySelector(`meta[name=${item}]`);
                if (!meta) {
                    meta = document.createElement('meta');
                    meta.setAttribute('name', item);
                    meta.setAttribute('content', bgColor);
                    document.getElementsByTagName('head')[0].appendChild(meta);
                } else {
                    meta.setAttribute('content', bgColor);
                }
            });
            return this.$store.state.display.theme;
        },
        currentTime () {
            return this.getFormattedDate(this.hwDateTime, this.$store.state.display.lang) +
                    ' ' + this.getFormattedTime(this.hwDateTime, this.$store.state.display.lang);
        },
        isNetPending () {
            return this.$store.state.is_net_pending;
        },
        lang () {
            return this.$store.state.display.lang;
        }
    },
    watch: {
        drawer (val) {
            setTimeout(function () {
                this.$bus.$emit($consts.EVENTS.DO_SCREEN_REBUILD);
            }, 150);
        }
    },
    data () {
        return {
            drawer: null,
            alerts: []
        };
    }
};
</script>

<style>

    .container {
        max-width: 100%
    }

    .status_label {
        display: block;
        float: left;
        margin: 12px;
    }

    .status_label.debugger {
        background: #aeea00;
        padding-left: 4px;
        padding-right: 4px;
    }

    #mainmenu a {
        text-decoration: none;
    }

    .cpr:before {
        font-size: 10px;
        line-height: 12px;
        vertical-align: top;
        content: '\A9';
    }

    /* Custom datetime picker stylers */

    .time-picker-title__time .picker__title__btn, .time-picker-title__time span {
        height: 56px !important;
        font-size: 60px !important;
    }

    .picker__body {
        margin: auto !important;
        max-width: 100%;
    }

    .theme--dark .list__tile {
        color: #fff;
    }

    .theme--light .list__tile {
        color: rgba(0, 0, 0, .87);
    }

    .theme--light .card {
        -webkit-box-shadow: none !important;
        box-shadow: none !important;
        border: solid 1px rgba(0, 0, 0, .1);
        border-radius: 4px;
    }

    @media (max-width: 599px) {
        table.table tbody td:first-child, table.table tbody td:not(:first-child),
        table.table tbody th:first-child, table.table tbody th:not(:first-child),
        table.table thead td:first-child, table.table thead td:not(:first-child),
        table.table thead th:first-child, table.table thead th:not(:first-child) {
            padding: 0 14px;
        }

        .container {
            padding: 2px !important;
        }

    }

    .v-time-picker-title__time .v-picker__title__btn, .v-time-picker-title__time span {
        height: 56px !important;
    }

    .v-picker__body {
        margin: auto;
    }

    .v-alert.warning a, .v-alert.warning a:active, .v-alert.warning a:hover {
        color: #fff;
    }

    .v-alert.error a, .v-alert.error a:active, .v-alert.error a:hover {
        color: #fff;
    }

    .v-alert.info a, .v-alert.info a:active, .v-alert.info a:hover {
        color: #fff;
    }

    .v-alert.success a, .v-alert.success a:active, .v-alert.success a:hover {
        color: #fff;
    }

</style>
