<template>
    <v-form lazy-validation ref="form">
        <v-card style="width: 100%">
            <v-card-title primary-title>
                <h1>{{'CLOUD_TITLE' | lang}}</h1>
                {{'CLOUD_DESCRIPTION' | lang}}
            </v-card-title>
            <v-card-text>
              <v-layout row wrap>
                <v-flex xs12>
                </v-flex>
              </v-layout>
            </v-card-text>
            <v-card-actions text-xs-right v-if="!hideActions">
              <form action="/cloud/deploy" method="get">
                <v-btn type="submit" @click="install">{{'INSTALL_TO_CLOUD' | lang }}</v-btn>
              </form>
            </v-card-actions>
        </v-card>
    </v-form>
</template>

<script>

import template from './Template.vue';

export default {
    name: 'SettingsDisplay',
    extends: template,
    computed: {
    },
    methods: {
        makeSecret () {
            const length = Math.random() * 16 + 16;
            const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let secret = '';
            for (let i = 0, n = charset.length; i < length; ++i) {
                secret += charset.charAt(Math.floor(Math.random() * n));
            }
            return secret;
        },
        install () {
            let url = new URL(process.env.CLOUD_URL);
            url.pathname = '/device/registration';
            url.searchParams.append('devname', this.$store.state.net.ap_ssid);
            url.searchParams.append('secret', this.makeSecret());
            url.searchParams.append('uuid', this.$store.state.hardware.profile.uuid);
            url.searchParams.append('link', `${window.location.origin}/cloud/registration`);
            window.location = url;
        },
        submit () {
            this.$store.dispatch('putConfiguration', {
                display: {
                    lang: this.$store.state.display.lang,
                    theme: this.$store.state.display.theme
                }
            });
        }
    },
    data () {
        return {
        };
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
