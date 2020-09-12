<template>
  <v-flex fill-height>
    <h1>{{ 'TITLE'|lang }}</h1>
    {{ 'DESCRIPTION'|lang }}
    <v-container>
      <v-layout>
        <v-flex xs12 md2>
          Connected:
        </v-flex>
        <v-flex xs12 md4>
          <template v-if="isConnected">
            Connected
          </template>
          <template v-else>
            Disconnected
          </template>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex xs12 md4>
          <v-text-field v-model="data"></v-text-field>
        </v-flex>
      </v-layout>
    </v-container>
  </v-flex>
</template>

<script>
import Template from '../ante/components/settings/Template';

export default {
    name: 'HTTP',
    components: {Template},
    mounted () {
        this.$bus.$emit($consts.EVENTS.UBUS_MESSAGE, 'do-refresh-state');
        this.$bus.$on($consts.EVENTS.UBUS_MESSAGE, (type, data) => {
            switch (type) {
            case 'mqtt-connected':
                this.isConnected = JSON.parse(data);
                break;
            case 'mqtt-on-data':
                this.data = JSON.parse(data);
                break;
            }
        });
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
