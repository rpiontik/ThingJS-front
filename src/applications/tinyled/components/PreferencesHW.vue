<template>
    <v-form ref="formhw" lazy-validation>
      <v-card style="width: 100%">
        <v-card-title primary-title>
          <v-container style="padding: 0">
            <v-layout row>
              <h1>{{'PREFS_TITLE_HW' | lang}}</h1>
            </v-layout>
            <v-layout :wrap="isMobileScreen">
              <v-flex xs12="isMobileScreen" class="col1">
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
            </v-layout>
          </v-container>
          <v-card-actions>
            <v-btn @click="submithw">{{'SUBMIT' | lang }}</v-btn>
          </v-card-actions>
        </v-card-title>
      </v-card>
    </v-form>
</template>

<script>

import Template from '../../ante/components/settings/Template';

export default {
    name: 'SettingsFenistHW',
    components: {Template},
    mounted () {
        this.$bus.$on($consts.EVENTS.UBUS_MESSAGE, (type, config) => {
            if (type === 'fenist-state-config') {
                let conf = JSON.parse(config);
                this.inverse = conf.inverse;
                this.frequency = conf.frequency;
                this.notReceived = false;
            }
        });
        this.$bus.$on($consts.EVENTS.WS_STARTED, this.refreshDeviceConfig);
        this.refreshDeviceConfig();
    },
    methods: {
        refreshDeviceConfig () {
            this.$bus.$emit($consts.EVENTS.UBUS_MESSAGE, 'fenist-get-config', null);
        },
        submithw () {
            this.$bus.$emit($consts.EVENTS.UBUS_MESSAGE, 'fenist-set-hw-config', JSON.stringify({
                inverse: this.inverse,
                frequency: this.frequency
            }));
        }
    },
    data () {
        let data = {
            notReceived: true,
            inverse: false,
            frequency: 400
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
