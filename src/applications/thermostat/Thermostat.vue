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
          <v-text-field v-model="temp"></v-text-field>
        </v-flex>
      </v-layout>
    </v-container>
  </v-flex>
</template>

<script>
import Template from '../ante/components/settings/Template';

export default {
    name: 'Thermostat',
    components: {Template},
    mounted () {
        this.$bus.$emit($consts.EVENTS.UBUS_MESSAGE, 'tmst-refresh-state');
        this.$bus.$on($consts.EVENTS.UBUS_MESSAGE, (type, data) => {
            switch (type) {
            case 'tmst-mqtt-connected':
                this.isConnected = JSON.parse(data);
                break;
            case 'tmst-on-temp':
                this.temp = JSON.parse(data);
                break;
            }
        });
    },
    computed: {
    },
    methods: {},
    data () {
        return {
            isConnected: false,
            temp: null
        };
    }
};
</script>

<style>

</style>
