<template>
    <v-app  id="inspire" :light="theme=='light'" :dark="theme=='dark'">
        <Navigator v-model="targetURI" :drawer="drawer"></Navigator>
        <v-toolbar app fixed clipped-left dense>
            <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
            <v-toolbar-title>ThingJS: debugger</v-toolbar-title>
        </v-toolbar>
        <v-content>
            <v-container fluid fill-height>
                <vue-splitter
                        :margin="4"
                        horizontal
                        class="editor-space"
                        @resize="onResizePanels"
                >
                    <vue-splitter
                            :margin="4"
                            class="editor-space"
                            @resize="onResizePanels"
                            slot="left-pane"
                            :defaultPercent="80"
                    >
                        <component
                                v-if="targetURI"
                                v-bind:is="renderComponent"
                                :uri="targetURI"
                                class="component-editor"
                                slot="left-pane"
                        ></component>
                        <watch-editor
                                slot="right-pane"
                                class="watch-editor"
                                :uri="targetURI"
                        >
                        </watch-editor>
                    </vue-splitter>

                    <div
                            class="console"
                            ref="console"
                            slot="right-pane">
                        <div
                                v-for="(item, i) in consoleLog"
                                :key="i"
                                :class="['console-item', item.type]"
                        ><v-chip small>{{item.app}}</v-chip>{{item.text}}</div>
                    </div>
                </vue-splitter>
            </v-container>
        </v-content>
        <v-footer app fixed>
            <div class="footer-item connected-status">
                <span :class="{'marker':true, 'connected': connected}"></span>
                {{connected ? 'Connected' : 'Disconnected'}}
            </div>
        </v-footer>

        <v-alert v-if="token" type="error" :value="true" transition="scale-transition"
                 style="position: fixed; left: 50%; top: 50%; width: 400px; height:120px; margin-left: -200px; margin-top: -60px; z-index: 20000"
        >
            <v-layout row>
                <v-flex>
                    Can not connect to device because debugger already started.
                </v-flex>
            </v-layout>
        </v-alert>


        <v-alert v-if="alerts.length"
                 :type="alerts[0].type"
                 :value="true"
                 transition="scale-transition"
                 style="position: fixed; right: 16px; top: 16px; width: 480px; max-width: 80%; z-index: 20000"
        >

            <v-layout row>
                <v-flex v-html="alerts[0].message">
                </v-flex>
                <v-flex shrink v-if="!alerts[0]['no-button']">
                    <v-btn
                            flat
                            @click="alerts = alerts.slice(1)"
                            style="float: right; margin-left: 4px; margin-right: 0;margin-top: 0;"
                    >Close</v-btn>
                </v-flex>
            </v-layout>
        </v-alert>
    </v-app>
</template>

<script>
    import consts from './consts';
    import Navigator from './components/Navigator.vue'
    import ScriptEditor from './components/renders/ScriptEditor.vue'
    import WatchEditor from './components/renders/WatchEditor.vue'
    import StorageEditor from './components/renders/StorageEditor.vue'
    import VueSplitter from "@rmp135/vue-splitter"
    import utils from "./utils"

    export default {
        name: 'ThingJS',
        components: {
            Navigator,
            'scripts-editor' : ScriptEditor,
            'watch-editor' : WatchEditor,
            'storage-editor' : StorageEditor,
            VueSplitter
        },
        created(){
            this.$store.dispatch('init');
            this.$store.commit('setUrl', this.$route.query.url);
        },
        mounted() {
            this.$bus.$on(consts.EVENTS.ALERT, (type, messages) => {
                this.alerts.push({
                    type : type,
                    message : messages
                });
            });
        },
        watch : {
            targetURI(new_value) {
                if(new_value) {
                    let url = utils.parseURI(new_value);
                    this.renderComponent = `${url.type}-editor`;
                } else
                    this.renderComponent = null;
            },
        },
        methods : {
            onResizePanels() {
                window.dispatchEvent(new Event('resize'));
            }
        },
        computed: {
            connected() {
                return this.$store.state.connected;
            },
            token() {
                return this.$store.state.token;
            },
            consoleLog() {
                Vue.nextTick(() => {
                    this.$refs.console.scrollTop = this.$refs.console.scrollHeight;
                });
                return this.$store.state.consolelog;
            }
        },
        data () {
            return {
                targetURI : null,
                renderComponent : null,
                theme : 'light',
                alerts : [],
                drawer : true
            }
        }
    }
</script>

<style>
    @import '../../src/assets/material_icons.css';
    @import '../../node_modules/vuetify/dist/vuetify.min.css';

    html, body {
        overflow-y: hidden;
        overflow-x: hidden;
    }

    .console {
        bottom: 32px;
        background: #fff;
        overflow-y: auto;
        height: 100%;
    }

    .console .console-item.stderr {
        color: red;
    }

    .component-editor, .editor-space, .watch-editor {
        position: absolute;
        top: 0px;
        left: 0px;
        right: 0px;
        bottom: 0px;
        height: 100%;
    }

    .splitter-pane {
        position: relative;
        overflow-y: hidden !important;
    }

    .footer-item {
        margin-left: 8px;
        margin-right: 8px;
    }

    .footer-item:first-child {
        margin-left: 16px;
    }

    .connected-status .marker {
        background: #880000 ;
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 6px;
    }

    .connected-status .marker.connected {
        background: #00c853 ;
    }

    .app-favicon {
        width: 24px;
        height: 24px;
    }

    .struct-item {
        padding-left:16px;
    }

    .tree-title {
        margin-left: 8px;
    }

    .splitter {
        background-color: #fafafa !important;
    }

</style>
