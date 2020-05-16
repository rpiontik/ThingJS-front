<template>
    <v-form lazy-validation ref="form">
        <v-card style="width: 100%">
            <v-card-title primary-title>
                <v-layout row wrap>
                    <h1>{{'APPS_TITLE' | lang}}</h1>
                    <v-flex xs12>
                        <v-data-table
                                :headers="headers"
                                :items="appList"
                                class="elevation-1"
                                hide-actions
                        >
                            <template slot="items" slot-scope="props">
                                <td colspan="4" v-if="!props.item.appid" width="100%">
                                    <a @click.prevent="doInstall" href="#">{{'INSTALL_NEW_APP' | lang}}</a>
                                </td>
                                <td v-if="props.item.appid" width="100%">{{ props.item.name }}</td>
                                <td class="text-xs-left" v-if="props.item.appid" width="1%">{{ props.item.version }}
                                </td>
                                <td class="text-xs-left" v-if="props.item.appid" width="1%">{{ props.item.vendor }}</td>
                                <td class="text-xs-right" v-if="props.item.appid" width="1%">
                                    <v-btn @click="onUninstall(props.item)" color="blue" flat icon>
                                        <v-icon title="uninstall">delete</v-icon>
                                    </v-btn>
                                </td>
                            </template>
                        </v-data-table>
                    </v-flex>
                </v-layout>
            </v-card-title>
        </v-card>
        <modal v-if="show_uninstall_modal">
            <h1 slot="title">{{'UNINSTALL_APP_TITLE' | lang}}</h1>
            <template slot="body">
                <div style="margin-bottom: 12px; width: 100%;"></div>
                <h2 style="width: 100%">{{selected_app.name}}</h2>
                <table style="width: 100%">
                    <tr>
                        <td width="1%">{{'VENDOR' | lang}}:</td>
                        <td width="100%">{{selected_app.vendor}}</td>
                    </tr>
                    <tr>
                        <td>{{'VERSION' | lang}}:</td>
                        <td>{{selected_app.version}}</td>
                    </tr>
                    <tr v-if="selected_app.description">
                        <td valign="top">{{'DESCRIPTION' | lang}}:</td>
                        <td>{{selected_app.description}}</td>
                    </tr>
                </table>
                <div style="margin-bottom: 12px; width: 100%;"></div>
                <p>{{'UNINSTALL_APP_BODY' | lang}}</p>
                <div style="margin-bottom: 24px; width: 100%;"></div>
            </template>
            <template slot="actions">
                <v-btn @click="show_uninstall_modal = false">{{'CANCEL' | lang }}</v-btn>
                <v-btn @click="doUninstall" flat>{{'UNINSTALL' | lang }}</v-btn>
            </template>
        </modal>
        <install-app @onclose="show_install_modal = false" v-if="show_install_modal"></install-app>
        <block-screen v-if="deleting"></block-screen>
    </v-form>
</template>

<script>

import modal from './../Modal.vue';
import installApp from './InstallApp.vue';
import template from './Template.vue';
import utils from './../../utils';
import blockScreen from './../BlockScreen.vue';

export default {
    name: 'Applications',
    components: {
        modal,
        'install-app': installApp,
        'block-screen': blockScreen
    },
    extends: template,
    computed: {
        appList () {
            let result = [{
                appid: null,
                name: null,
                vendor: null,
                version: null
            }];
            if (this.$store.state.apps.manifest) {
                for (let appid in this.$store.state.apps.manifest) {
                    let manifest = this.$store.state.apps.manifest[appid];
                    result.push({
                        appid: appid,
                        name: manifest.name,
                        vendor: manifest.vendor,
                        version: utils.getStrVersion(manifest),
                        description: utils.getDescription(manifest)
                    });
                }
            }
            return result;
        }
    },
    methods: {
        doInstall () {
            this.show_install_modal = true;
        },
        doUninstall () {
            this.deleting = true;
            this.$axios.delete(`/uninstall/${this.selected_app.appid}`, {}
            ).then(() => {
                this.$store.commit('decNetPending');
                document.location.reload(true);
            })
                .catch((e) => {
                    this.deleting = false;
                    this.$store.commit('decNetPending');
                    this.$bus.$emit(
                        $consts.EVENTS.ALERT,
                        $consts.ALERT_TYPE.ERROR,
                        Vue.filter('lang')('ERROR_APP_UNINSTALL')
                    );
                });
        },
        onUninstall (app) {
            this.show_uninstall_modal = true;
            this.selected_app = app;
        }
    },
    data () {
        return {
            show_uninstall_modal: false,
            show_install_modal: false,
            selected_app: null,
            deleting: false,
            headers: [
                {text: Vue.filter('lang')('APPLICATION'), align: 'left', value: 'name'},
                {text: Vue.filter('lang')('VERSION'), align: 'left', value: 'version'},
                {text: Vue.filter('lang')('VENDOR'), align: 'left', value: 'vendor'},
                {text: '', sortable: false, value: 'action'}
            ]
        };
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

    h3 {
        width: 100%;
    }

</style>
