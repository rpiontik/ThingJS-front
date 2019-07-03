<template>
    <v-form v-model="is_valid" :lazy-validation="lazyValidation" ref="form">
        <v-card style="width: 100%">
            <v-card-title primary-title>
                <v-layout row wrap>
                    <h1>{{'ACCESS_POINT' | lang }}</h1>
                    <v-flex xs12>
                        <v-text-field
                                :label="'NAME' | lang "
                                v-model="apSSID"
                                :rules="[validateAPName]"
                                :counter="32"
                                required
                        ></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                        <v-text-field
                                :label="lblPassword(ap_password)"
                                v-model="ap_password"
                                :append-icon="show_pswd_ap ? 'visibility' : 'visibility_off'"
                                @click:append="() => (show_pswd_ap = !show_pswd_ap)"
                                :type="!show_pswd_ap ? 'password' : 'text'"
                                :counter="32">
                        </v-text-field>
                    </v-flex>
                    <h1>{{'INTERNET_CONNECTION' | lang }}</h1>
                    <v-flex xs12>
                        <v-layout row>
                            <v-flex xs11 tile flat>
                                <v-autocomplete
                                        :label="'ACCESS_POINT' | lang"
                                        v-model="staSSID"
                                        :items="ap_list"
                                        :rules="[v => !!v || 'Item is required']"
                                        :disabled="isAPListReloading"
                                        required
                                        flat
                                        hide-no-data
                                        hide-details
                                ></v-autocomplete>
                            </v-flex>
                            <v-flex xs1 style="padding-top: 12px;">
                                <v-btn v-if="!isAPListReloading" icon @click="doRefreshAPList">
                                    <v-icon>refresh</v-icon>
                                </v-btn>
                                <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
                            </v-flex>
                        </v-layout>
                        <v-flex xs12>
                            <v-text-field
                                    :label="lblPassword(sta_password)"
                                    type="password"
                                    v-model="sta_password"
                                    :disabled="staSSID=='DISABLE'"
                                    :append-icon="show_pswd_sta ? 'visibility' : 'visibility_off'"
                                    @click:append="() => (show_pswd_sta = !show_pswd_sta)"
                                    :type="!show_pswd_sta ? 'password' : 'text'"
                                    :counter="32">
                            </v-text-field>
                        </v-flex>
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-card-actions v-if="!hideActions" text-xs-right>
                <v-btn @click="submit" :disabled="!is_valid">{{'SUBMIT' | lang}}</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>

<script>

    import template from './Template.vue'

    let CONST_DISABLE_CONNECT = '$DISABLE$';

    export default {
        name: 'SettingsNetwork',
        extends: template,
        methods: {
            validateAPName(value) {
                if (!value || value.length < 6 || !/[a-zA-Z0-9]/.test(value))
                    return Vue.filter('lang')('ERROR_AP_NAME');
                else
                    return true;
            },
            doRefreshAPList() {
                this.sta_ssid = "";
                this.$store.dispatch('refreshAccessPointsList');
            },

            lblPassword(password) {
                if (!password || !password.length)
                    return Vue.filter('lang')('PASSWORD_NO_CHANGE')
                else
                    return Vue.filter('lang')('PASSWORD')
            },

            customFilter(item, queryText, itemText){


                for(let f in this.ap_list){

                    if(queryText && this.ap_list[f].value.substr(0, queryText.length) == queryText) {
                        if(!this.sta_ssid_custom)
                            this.sta_ssid_custom    = null;
                        return true;
                    }

                }

                if(queryText && queryText.length){
                    this.sta_ssid_custom    = queryText;
                    this.sta_ssid           = queryText;
                }

                return true;

            },

            submit() {
                if (this.$refs.form.validate()) {
                    let data    = {net:{}};
                    if(this.apSSID != this.$store.state.net.ap_ssid)
                        data.net.ap_ssid    = this.apSSID;

                    if(this.staSSID != this.$store.state.net.sta_ssid)
                        data.net.sta_ssid    = this.staSSID == CONST_DISABLE_CONNECT ? '' : this.staSSID;

                    if(this.ap_password && this.ap_password.length)
                        data.net.ap_password    = this.ap_password;

                    if(this.sta_password && this.sta_password.length)
                        data.net.sta_password   = this.sta_password;

                    for(let key in data) {
                        this.$store.dispatch('putConfiguration', data);
                        break;
                    }
                }
            },

        },
        computed: {
            ap_list() {

                let result = [];

                if(this.sta_ssid_custom){
                    result.push({
                        value: this.sta_ssid_custom,
                        text: this.sta_ssid_custom
                    });
                }

                result.push({
                    value: CONST_DISABLE_CONNECT,
                    text: Vue.filter('lang')('NO_CONNECT')
                });

                if(this.$store.state.net.sta_ssid && this.$store.state.net.sta_ssid.length){
                    result.push({
                        value: this.$store.state.net.sta_ssid,
                        text: this.$store.state.net.sta_ssid
                    });
                }

                this.$store.state.net.ap_available.map((item) => {
                    if(item.name != this.$store.state.net.sta_ssid){
                        result.push({
                            value: item.name,
                            text: item.name
                        });
                    }
                });

                return result;
            },
            apSSID : {
                get(){
                    if(!this.ap_ssid)
                        return this.$store.state.net.ap_ssid;
                    else
                        return this.ap_ssid;
                },
                set(value){
                    this.ap_ssid    = value;
                }
            },
            staSSID : {
                get(){
                    if(!this.sta_ssid){
                        if(this.$store.state.net.sta_ssid && this.$store.state.net.sta_ssid.length)
                            return this.$store.state.net.sta_ssid;
                        else
                            return CONST_DISABLE_CONNECT;
                    } else
                        return this.sta_ssid;
                },
                set(value){
                    this.sta_ssid   = value;
                }
            }

        },
        data() {
            return {
                is_valid: this.lazyValidation,
                show_pswd_ap: false,
                show_pswd_sta: false,
                ap_ssid: null,
                ap_password: "",
                sta_ssid_custom : null,
                sta_ssid: null,
                sta_password: ""
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
