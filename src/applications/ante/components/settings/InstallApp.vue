<template>
    <modal>
        <h1 slot="title">{{'INSTALL_APP_TITLE' | lang}}</h1>
        <template slot="body">
            <v-container grid-list-md>
                <v-layout row wrap>
                    <v-flex xs12>
                        <label class="label-file">
                            <v-icon class="app-ico" color="grey" large v-if="!manifest || !manifest.favicon">extension
                            </v-icon>
                            <img :src="manifest.favicon" class="app-ico" v-else>
                            <div class="app-caption">
                                <span v-html="htmlFileCaption" v-if="!manifest"></span>
                                <h2 v-else>{{manifest.name}}</h2>
                            </div>
                            <input
                                    @change="readFile"
                                    accept=".smt"
                                    style="position: absolute; width: 0.1px; height: 0.1px; z-index: -1; opacity: 0; overflow: hidden;"
                                    type="file"
                            />
                        </label>
                    </v-flex>
                    <v-flex xs12>
                        <table class="app-params-table">
                            <tr>
                                <td width="1%">{{'VENDOR' | lang}}:</td>
                                <td>{{manifest ? manifest.vendor : ''}}</td>
                            </tr>
                            <tr>
                                <td valign="top" width="1%">{{'DESCRIPTION' | lang}}:</td>
                                <td>{{description}}</td>
                            </tr>
                            <tr>
                                <td width="1%">{{'SIZE' | lang}}:</td>
                                <td>{{manifest ? Math.round(size / 1024 + 1) : ''}}kB</td>
                            </tr>
                            <tr>
                                <td width="1%">{{'VERSION' | lang}}:</td>
                                <td>{{manifest ? version : ''}}</td>
                            </tr>
                        </table>
                    </v-flex>
                    <v-flex style="margin-bottom: 36px; max-height: 200px; overflow-y: auto; overflow-x: hidden;" xs12>
                        <binder :manifest="manifest" style="width: 100%; margin-bottom: 24px;"
                                v-model="config"></binder>
                    </v-flex>
                </v-layout>
            </v-container>
        </template>
        <template slot="actions">
            <v-btn @click="$emit('onclose')">{{'CANCEL' | lang }}</v-btn>
            <v-btn :disabled="!manifest" @click="doInstall" flat>{{'INSTALL' | lang }}</v-btn>
            <block-screen v-if="installing"></block-screen>
        </template>
    </modal>
</template>

<script>

    import modal from './../Modal.vue';
    import blockScreen from './../BlockScreen.vue';
    import utils from './../../utils';
    import binder from '../binder/Binder.vue';

    const consts = window.$consts;

    export default {
        name: 'InstallApplication',
        components: {
            modal,
            'block-screen': blockScreen,
            'binder': binder
        },
        methods: {
            doInstall() {
                let formData = new FormData();
                formData.append('data[]', new Blob([this.buffer]), 'bundle.smt');
                formData.append('data[]', new Blob([JSON.stringify(this.config)]), 'config.json');
                console.info('Append hw_resources.json');
                this.$store.commit('incNetPending');
                this.installing = true;
                this.$axios.post('/install',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                ).then(() => {
                    this.$store.commit('decNetPending');
                    document.location.reload(true);
                })
                    .catch((e) => {
                        console.error(e);
                        this.installing = false;
                        this.$store.commit('decNetPending');
                        this.$bus.$emit(
                            consts.EVENTS.ALERT,
                            consts.ALERT_TYPE.ERROR,
                            Vue.filter('lang')('ERROR_APP_INSTALL')
                        );
                    });
            },

            readString(dataview, offset, length) {
                let result = [];

                for (let pos = offset, len = 0; len < length; len++, pos++) {
                    result.push(dataview.getInt8(pos));
                }

                return (new TextDecoder()).decode(new Uint8Array(result));
            },

            checkManifest() {
                for (let appid in this.$store.state.apps.manifest) {
                    let app = this.$store.state.apps.manifest[appid];
                    if (app.name === this.manifest.name) {
                        this.$bus.$emit(
                            consts.EVENTS.ALERT,
                            consts.ALERT_TYPE.INFO,
                            Vue.filter('lang')('INFO_APP_ALREADY_INSTALLED') + utils.getStrVersion(app)
                        );
                    }
                }
            },

            readFile(evt) {
                let files = evt.target.files;
                let file = files[0];
                let reader = new FileReader();
                this.manifest = null;
                this.size = null;
                this.buffer = null;
                reader.onload = (event) => {
                    this.buffer = event.target.result;
                    this.size = this.buffer.byteLength;

                    let dataview = new DataView(this.buffer);

                    if (this.readString(dataview, 0, 6) !== 'SMTB02') {
                        this.$bus.$emit(
                            consts.EVENTS.ALERT,
                            consts.ALERT_TYPE.ERROR,
                            Vue.filter('lang')('ERROR_APP_BUNDLE_FORMAT')
                        );
                        return;
                    }

                    let nameLen = dataview.getUint32(6, true);
                    let manifestLen = dataview.getUint32(10 + nameLen, true);
                    this.manifest = JSON.parse(this.readString(dataview, 14 + nameLen, manifestLen));

                    this.checkManifest();
                };
                if (file) {
                    reader.readAsArrayBuffer(file);
                }
            }
        },
        computed: {
            version() {
                return utils.getStrVersion(this.manifest);
            },
            htmlFileCaption() {
                return Vue.filter('lang')('DO_SELECT_APP');
            },
            description() {
                return !this.manifest ? '' : utils.getDescription(this.manifest);
            }
        },
        data() {
            return {
                manifest: null,
                config: null,
                size: null,
                file: null,
                buffer: null,
                installing: false
            };
        }
    };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

    .app-ico {
        width: 64px;
        height: 64px;
        display: flex;
        font-size: 64px !important;
    }

    .app-caption {
        display: flex;
        width: 100%;
        text-align: center;
        align-items: center;
        padding: 4px;
    }

    .app-caption span {
        margin: auto;
    }

    .label-file {
        display: flex;
        width: 100%;
        background: rgba(0, 0, 0, 0.15);
        border: solid 1px #ccc;
        border-radius: 4px;
        padding: 2px;
    }

</style>
