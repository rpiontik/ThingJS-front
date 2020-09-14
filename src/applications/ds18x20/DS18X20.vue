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
        <v-flex xs12 md12>
          {{ 'CURR_TEMP'|lang }}: {{temperature}}
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex xs12 md12>
          <v-btn round large color="primary" @click="doRefresh">{{'FORCE_UPDATE'|lang }}</v-btn>
        </v-flex>
      </v-layout>
    </v-container>
  </v-flex>
</template>

<script>
import Template from '../ante/components/settings/Template';

export default {
    name: 'DS18X20',
    components: {Template},
    mounted () {
        this.doRefresh();
        this.$bus.$on($consts.EVENTS.UBUS_MESSAGE, (type, data) => {
            switch (type) {
            case 'ds18x20-temp':
                this.temperature = JSON.parse(data);
                break;
            }
        });
    },
    methods: {
        doRefresh () {
            this.$bus.$emit($consts.EVENTS.UBUS_MESSAGE, 'do-refresh-temp');
        }
    },
    computed: {
        timeFromBroker () {
            return this.getFormattedDate(this.data) + ' ' + this.getFormattedTime(this.data);
        }
    },
    data () {
        return {
            temperature: ''
        };
    }
};
</script>

<style>

</style>
