<template>
    <v-form ref="form" lazy-validation>
        <v-card style="width: 100%">
            <v-card-title primary-title>
                <v-container style="padding: 0">
                  <v-layout row>
                    <h1>{{'PREFS_TITLE_CLOUD' | lang}}</h1>
                  </v-layout>
                  <v-layout :wrap="isMobileScreen">
                    <v-flex xs12="isMobileScreen" class="col1">
                      <v-text-field
                          v-model="deviceId"
                          class="col1 device-id"
                          :label="'DEVICE_ID' | lang"
                          type="text"
                          maxlength="10"
                          :disabled="notReceived"
                      ></v-text-field>
                      <v-switch
                          v-model="inverse"
                          :label="'INVERSE' | lang"
                          :disabled="notReceived"
                      ></v-switch>
                      <v-slider
                          v-model="frequency"
                          thumb-label="always"
                          :label="'FREQUENCY' | lang"
                          :max="2440"
                          :min="100"
                          :disabled="notReceived"
                      ></v-slider>
                    </v-flex>
                    <v-flex xs12="isMobileScreen" class="row1">
                      <v-switch
                          v-model="rel1"
                          :label="'RELAY' | lang"
                          :disabled="notReceived"
                      ></v-switch>
                      <v-switch
                          v-model="rel2"
                          :label="'RELAY' | lang"
                          :disabled="notReceived"
                      ></v-switch>
                      <v-switch
                          v-model="rel3"
                          :label="'RELAY' | lang"
                          :disabled="notReceived"
                      ></v-switch>
                      <v-switch
                          v-model="rel4"
                          :label="'RELAY' | lang"
                          :disabled="notReceived"
                      ></v-switch>
                    </v-flex>
                  </v-layout>
                </v-container>
            </v-card-title>
            <v-card-actions text-xs-right>
                <v-btn @click="submit">{{'SUBMIT' | lang }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>

<script>

import Template from '../../ante/components/settings/Template';

export default {
    name: 'SettingsTinyLED',
    components: {Template},
    mounted () {
        this.$bus.$on($consts.EVENTS.UBUS_MESSAGE, (type, config) => {
            if (type === 'lucerna-state-config') {
                let conf = JSON.parse(config);
                this.deviceId = conf.uuid;
                this.inverse = conf.inverse;
                this.notReceived = false;
                this.frequency = conf.frequency;
                //debugger;
                console.info(this.rel1);
                this.rel1 = conf.relay1;
                console.info(this.rel1);
                this.rel2 = conf.relay2;
                this.rel3 = conf.relay3;
                this.rel4 = conf.relay4;
            }
        });
        this.$bus.$on($consts.EVENTS.WS_STARTED, this.refreshDeviceID);
        this.refreshDeviceID();
    },
    methods: {
        refreshDeviceID () {
            this.$bus.$emit($consts.EVENTS.UBUS_MESSAGE, 'lucerna-get-config', null);
        },

        submit () {
            this.$bus.$emit($consts.EVENTS.UBUS_MESSAGE, 'lucerna-set-config', JSON.stringify({
                uuid: this.deviceId,
                inverse: this.inverse,
                frequency: this.frequency,
                relay1: this.rel1,
                relay2: this.rel2,
                relay3: this.rel3,
                relay4: this.rel4
            }));
        }
    },
    data () {
        let data = {
            notReceived: true,
            deviceId: '',
            inverse: false,
            frequency: 400,
            rel1: false,
            rel2: false,
            rel3: false,
            rel4: false
        };

        return data;
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="css" scoped>

    .device-id /deep/ input{
      text-transform: uppercase !important;
    }

    .col1 {
        padding-right: 4px;
    }

</style>
