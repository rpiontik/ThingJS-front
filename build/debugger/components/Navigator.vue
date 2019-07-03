<template>
    <v-navigation-drawer v-model="drawer" clipped fixed app value="true">
        <v-list>
            <v-list-group v-for="(app, app_name) in manifest" :key="app_name" value="true">
                <template v-slot:activator>
                    <v-list-tile>
                        <img v-if="app.favicon" :src="app.favicon" class="app-favicon">
                        <v-icon v-else>extension</v-icon>
                        <span class="tree-title">{{app_name}}</span>
                    </v-list-tile>
                </template>
                <v-list-group v-if="app.scripts && app.scripts.modules" value="true" sub-group no-action>
                    <template v-slot:activator>
                        <v-list-tile>
                            <v-icon>code</v-icon>
                            <span class="tree-title">scripts</span>
                        </v-list-tile>
                    </template>
                    <v-list-tile v-for="(module, module_name) in app.scripts.modules"
                                 :key="makeURI('script', app_name, module_name)"
                                 @click="onClickItem('scripts', app_name, module_name)"
                                 :class="{'selected' : makeURI('scripts', app_name, module_name) == selectedURI}"
                    >
                        <v-list-tile-title>{{module_name}}</v-list-tile-title>
                        <v-list-tile-action>
                            <v-icon>code</v-icon>
                        </v-list-tile-action>
                    </v-list-tile>
                </v-list-group>
                <v-list-group v-if="app.storage && app.storage.objects" value="true" sub-group no-action>
                    <template v-slot:activator>
                        <v-list-tile>
                            <v-icon>storage</v-icon>
                            <span class="tree-title">storages</span>
                        </v-list-tile>
                    </template>
                    <v-list-tile v-for="(storage, storage_name) in app.storage.objects"
                                 :key="makeURI('storage', app_name, storage_name)"
                                 @click="onClickItem('storage', app_name, storage_name)"
                                 :class="{'selected' : makeURI('storage', app_name, storage_name) == selectedURI}"
                    >
                        <v-list-tile-title>{{storage_name}}</v-list-tile-title>
                        <v-list-tile-action>
                            <v-icon>storage</v-icon>
                        </v-list-tile-action>
                    </v-list-tile>
                </v-list-group>
            </v-list-group>
        </v-list>
    </v-navigation-drawer>
</template>

<script>
    import consts from '../consts';
    import utils from '../utils'

    export default {
        name: 'Navigator',
        props : ['value', 'drawer'],
        watch : {
            selectedURI() {
                this.$emit('input', this.selectedURI);
            },
            manifest(manifest) {
                if(!this.selectedURI)
                    return;
                let uri = utils.parseURI(this.selectedURI);
                if(
                    !(uri.app in manifest)
                    || !(uri.type in manifest[uri.app])
                    || !(uri.id in manifest[uri.app][uri.type])
                )
                    this.selectedURI = null;
            }
        },
        mounted(){
            this.$bus.$on([consts.DEBUGGER_EVENT.DEBUGGER_DETECTED, consts.DEBUGGER_EVENT.DEBUGGER_ON_ERROR], (message) => {
                let source  = message.source.split('.')[0];
                if(this.manifest && (message.app in this.manifest)
                        && (source in this.manifest[message.app].scripts.modules)) {
                    this.onClickItem('scripts', message.app, source);
                }
            });
        },
        methods : {
            makeURI(type, appname, id){
                return utils.makeURI(type, appname, id);
            },
            onClickItem(type, appname, id){
                this.selectedURI = this.makeURI(type, appname, id);
            }
        },
        computed: {
            manifest() {
                return this.$store.state.manifest;
            }
        },
        data () {
            return {
                selectedURI : null
            }
        }
    }
</script>

<style scoped>
    .selected {
        background-color: #2d7091;
        color: #fff;
    }
</style>
