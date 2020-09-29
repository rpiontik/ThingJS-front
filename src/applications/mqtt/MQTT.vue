<template>
  <v-flex fill-height>
    <h1>{{ 'TITLE'|lang }}</h1>
    <v-container>
      <v-layout>
        <v-flex xs12 md4>
          {{ 'DESCRIPTION'|lang }}
        </v-flex>
      </v-layout>
    </v-container>
    <v-container>
      <v-layout>
        <v-flex xs12 md2>
          Status:
          <template v-if="isConnected">
            connected
          </template>
          <template v-else>
            Disconnected
          </template>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex xs12 md4>
          <v-text-field v-model="timeFromBroker"></v-text-field>
        </v-flex>
      </v-layout>
    </v-container>
  </v-flex>
</template>

<script>
import Template from '../ante/components/settings/Template';

export default {
    name: 'MQTT',
    components: {Template},
    mounted () {
        this.$bus.$emit($consts.EVENTS.UBUS_MESSAGE, 'do-refresh-state');
        this.$bus.$on($consts.EVENTS.UBUS_MESSAGE, (type, data) => {
            switch (type) {
            case 'mqtt-connected':
                this.isConnected = JSON.parse(data);
                break;
            case 'mqtt-on-data':
                this.data = new Date(JSON.parse(data) * 1000 + (new Date()).getTimezoneOffset() * 60000);
                break;
            }
        });
    },
    computed: {
        timeFromBroker () {
            return this.getFormattedDate(this.data) + ' ' + this.getFormattedTime(this.data);
        }
    },
    methods: {},
    data () {
        return {
            isConnected: false,
            data: null
        };
    }
};
</script>

<style>

</style>
