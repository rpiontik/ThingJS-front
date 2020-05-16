<template>
    <v-form>
        <v-card style="width: 100%">
            <v-card-title primary-title>
                <v-layout row wrap>
                    <h1>{{'DATE_TIME' | lang}}</h1>
                    <v-flex xs12>
                        <v-select
                                :items="timeZones"
                                :label="'TIME_ZONE' | lang"
                                :rules="[v => !!v || 'Item is required']"
                                required
                                v-model="timeZone"
                        ></v-select>
                    </v-flex>
                    <template style="display: flex; flex-wrap: wrap" v-if="isMobileScreen">
                        <v-flex xs12>
                            <v-date-picker class="float_packer" style="display: flex; width: 100%"
                                           v-model="currDate"></v-date-picker>
                            <v-time-picker class="float_packer" format="24hr" style="display: flex; width: 100%"
                                           v-model="currTime"></v-time-picker>
                        </v-flex>
                    </template>
                    <template v-else>
                        <v-flex class="text-xs-center" style="display: flex;" xs12>
                            <v-date-picker full-width style="display: flex; width: 50%;"
                                           v-model="currDate"></v-date-picker>
                            <v-time-picker class="time-picker" format="24hr" style="display: flex; width: 50%;"
                                           v-model="currTime"></v-time-picker>
                        </v-flex>
                    </template>
                    <v-flex xs12>
                        <span style="display: block; height: 16px;"></span>
                        <v-checkbox v-bind:label="'NTP_SYNC' | lang" v-model="ntp_sync"></v-checkbox>
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-card-actions style="margin-top: -28px;" text-xs-right>
                <v-btn @click="submit" v-if="!hideActions">{{'SUBMIT' | lang }}</v-btn>
                <v-btn @click="reset" flat>{{'RESET' | lang }}</v-btn>
                <v-btn @click="current" flat>{{'CURRENT' | lang }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>

<script>

import consts from '../../consts';
import template from './Template.vue';

export default {
    name: 'SettingsDatetime',
    extends: template,
    computed: {

        currDate: {
            get () {
                if (this.custom_date) {
                    return this.custom_date;
                } else {
                    return this.getFormattedDate(this.hwDateTime, 'vuetifyjs');
                }
            },
            set (value) {
                this.custom_date = value;
            }
        },

        currTime: {
            get () {
                if (this.custom_time) {
                    return this.custom_time;
                } else {
                    return this.getFormattedTime(this.hwDateTime, 'vuetifyjs');
                }
            },
            set (value) {
                this.custom_time = value;
            }
        },

        timeZones () {
            return consts.TIME_ZONES;
        },
        ntp_sync: {
            get () {
                return this.custom_ntp_sync !== null ? this.custom_ntp_sync : this.$store.state.net.sync_with_ntp;
            },
            set (value) {
                this.custom_ntp_sync = value;
            }
        },
        timeZone: {
            get () {
                if (this.new_timezone) {
                    return this.new_timezone;
                }

                let timeOffset = this.$store.state.datetime.time_zone_offset;

                if (timeOffset === null) {
                    timeOffset = -(new Date()).getTimezoneOffset();
                }

                for (let timezone in consts.TIME_ZONES) {
                    if ((+consts.TIME_ZONES[timezone].offset) == (+timeOffset)) {
                        return consts.TIME_ZONES[timezone].value;
                    }
                }

                return null;
            },
            set (value) {
                this.new_timezone = value;
            }
        },

        timezoneOffset () {
            for (let timezone in consts.TIME_ZONES) {
                if (consts.TIME_ZONES[timezone].value === this.timeZone) {
                    return consts.TIME_ZONES[timezone].offset;
                }
            }

            return 0;
        }
    },
    props: {
        float: {
            type: Boolean,
            default: false
        },
        value: {}
    },
    methods: {
        current () {
            this.custom_date = this.getFormattedDate(new Date(), 'vuetifyjs');
            this.custom_time = this.getFormattedTime(new Date(), 'vuetifyjs');

            let currentOffset = -(new Date()).getTimezoneOffset();

            for (let timezone in consts.TIME_ZONES) {
                if (consts.TIME_ZONES[timezone].offset === currentOffset) {
                    this.new_timezone = consts.TIME_ZONES[timezone].value;
                }
            }
        },
        reset () {
            this.custom_date = null;
            this.custom_time = null;
            this.new_timezone = null;
        },
        submit () {
            let currMoment = (new Date(this.currDate + ' ' + this.currTime));
            currMoment = currMoment.getTime() - currMoment.getTimezoneOffset() * 60000;

            this.$store.dispatch('putConfiguration', {
                net: {
                    sync_with_ntp: this.ntp_sync ? '1' : '0'
                },
                time: {
                    current: '' + currMoment,
                    offset: '' + this.timezoneOffset
                }
            });
        }
    },

    data () {
        return {
            custom_date: null,
            custom_time: null,
            custom_ntp_sync: null,
            new_timezone: null
        };
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

    .float_packer {
        float: left;
    }

</style>
