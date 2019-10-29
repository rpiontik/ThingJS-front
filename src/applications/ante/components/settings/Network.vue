<template>
    <v-form :lazy-validation="lazyValidation" ref="form" v-model="is_valid">
        <v-card style="width: 100%">
            <v-card-title primary-title>
                <v-layout row wrap>
                    <h1>{{'ACCESS_POINT' | lang }}</h1>
                    <v-flex xs12>
                        <v-text-field
                                :counter="32"
                                :label="'NAME' | lang "
                                :rules="[validateAPName]"
                                required
                                v-model="apSSID"
                        ></v-text-field>
                    </v-flex>
                    <v-flex xs12>
                        <v-text-field
                                :append-icon="show_pswd_ap ? 'visibility' : 'visibility_off'"
                                :counter="32"
                                :label="lblPassword(ap_password)"
                                :type="!show_pswd_ap ? 'password' : 'text'"
                                @click:append="() => (show_pswd_ap = !show_pswd_ap)"
                                v-model="ap_password">
                        </v-text-field>
                    </v-flex>
                    <h1>{{'INTERNET_CONNECTION' | lang }}</h1>
                    <v-flex xs12>
                        <v-layout row>
                            <v-flex flat tile xs11>
                                <v-autocomplete
                                        :disabled="isAPListReloading"
                                        :items="ap_list"
                                        :label="'ACCESS_POINT' | lang"
                                        :rules="[v => !!v || 'Item is required']"
                                        flat
                                        hide-details
                                        hide-no-data
                                        required
                                        v-model="staSSID"
                                ></v-autocomplete>
                            </v-flex>
                            <v-flex style="padding-top: 12px;" xs1>
                                <v-btn @click="doRefreshAPList" icon v-if="!isAPListReloading">
                                    <v-icon>refresh</v-icon>
                                </v-btn>
                                <v-progress-circular color="primary" indeterminate v-else></v-progress-circular>
                            </v-flex>
                        </v-layout>
                        <v-flex xs12>
                            <v-text-field
                                    :append-icon="show_pswd_sta ? 'visibility' : 'visibility_off'"
                                    :counter="32"
                                    :disabled="staSSID=='DISABLE'"
                                    :label="lblPassword(sta_password)"
                                    :type="!show_pswd_sta ? 'password' : 'text'"
                                    @click:append="() => (show_pswd_sta = !show_pswd_sta)"
                                    type="password"
                                    v-model="sta_password">
                            </v-text-field>
                        </v-flex>
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-card-actions text-xs-right v-if="!hideActions">
                <v-btn :disabled="!is_valid" @click="submit">{{'SUBMIT' | lang}}</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>

<script>

import template from './Template.vue';

let CONST_DISABLE_CONNECT = '$DISABLE$';

export default {
  name: 'SettingsNetwork',
  extends: template,
  methods: {
    validateAPName (value) {
      if (!value || value.length < 6 || !/[a-zA-Z0-9]/.test(value)) { return Vue.filter('lang')('ERROR_AP_NAME'); } else { return true; }
    },
    doRefreshAPList () {
      this.sta_ssid = '';
      this.$store.dispatch('refreshAccessPointsList');
    },

    lblPassword (password) {
      if (!password || !password.length) { return Vue.filter('lang')('PASSWORD_NO_CHANGE'); } else { return Vue.filter('lang')('PASSWORD'); }
    },

    customFilter (item, queryText, itemText) {
      for (let f in this.ap_list) {
        if (queryText && this.ap_list[f].value.substr(0, queryText.length) == queryText) {
          if (!this.sta_ssid_custom) { this.sta_ssid_custom = null; }
          return true;
        }
      }

      if (queryText && queryText.length) {
        this.sta_ssid_custom = queryText;
        this.sta_ssid = queryText;
      }

      return true;
    },

    submit () {
      if (this.$refs.form.validate()) {
        let data = {net: {}};
        if (this.apSSID != this.$store.state.net.ap_ssid) { data.net.ap_ssid = this.apSSID; }

        if (this.staSSID != this.$store.state.net.sta_ssid) { data.net.sta_ssid = this.staSSID == CONST_DISABLE_CONNECT ? '' : this.staSSID; }

        if (this.ap_password && this.ap_password.length) { data.net.ap_password = this.ap_password; }

        if (this.sta_password && this.sta_password.length) { data.net.sta_password = this.sta_password; }

        for (let key in data) {
          this.$store.dispatch('putConfiguration', data);
          break;
        }
      }
    }

  },
  computed: {
    ap_list () {
      let result = [];

      if (this.sta_ssid_custom) {
        result.push({
          value: this.sta_ssid_custom,
          text: this.sta_ssid_custom
        });
      }

      result.push({
        value: CONST_DISABLE_CONNECT,
        text: Vue.filter('lang')('NO_CONNECT')
      });

      if (this.$store.state.net.sta_ssid && this.$store.state.net.sta_ssid.length) {
        result.push({
          value: this.$store.state.net.sta_ssid,
          text: this.$store.state.net.sta_ssid
        });
      }

      this.$store.state.net.ap_available.map((item) => {
        if (item.name != this.$store.state.net.sta_ssid) {
          result.push({
            value: item.name,
            text: item.name
          });
        }
      });

      return result;
    },
    apSSID: {
      get () {
        if (!this.ap_ssid) { return this.$store.state.net.ap_ssid; } else { return this.ap_ssid; }
      },
      set (value) {
        this.ap_ssid = value;
      }
    },
    staSSID: {
      get () {
        if (!this.sta_ssid) {
          if (this.$store.state.net.sta_ssid && this.$store.state.net.sta_ssid.length) { return this.$store.state.net.sta_ssid; } else { return CONST_DISABLE_CONNECT; }
        } else { return this.sta_ssid; }
      },
      set (value) {
        this.sta_ssid = value;
      }
    }

  },
  data () {
    return {
      is_valid: this.lazyValidation,
      show_pswd_ap: false,
      show_pswd_sta: false,
      ap_ssid: null,
      ap_password: '',
      sta_ssid_custom: null,
      sta_ssid: null,
      sta_password: ''
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
