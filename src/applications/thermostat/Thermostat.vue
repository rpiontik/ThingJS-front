<template>
  <v-flex fill-height style="max-width: 600px">
    <h1>{{ 'TITLE'|lang }}</h1>
    <v-container>
      <v-layout>
        <v-flex xs12 md12>
          {{ 'DESCRIPTION'|lang }}
        </v-flex>
      </v-layout>
    </v-container>
    <v-layout>
      <v-flex class="current-temp" xs12 md4>
          <span>
            <template v-if="state.temp !== null">
              {{state.temp.toFixed(1)}}°
            </template>
            <template v-else>
              --.--
            </template>
          </span>
      </v-flex>
      <v-flex xs12 md4 style="text-align: center; padding: 12px; ">
        <template v-if="state.state === 1">
          <v-icon
              title="Power on"
              class="indicator"
          >power</v-icon>
        </template>
        <template v-else-if="state.state === 0">
          <v-icon
              title="Power off"
              class="indicator"
          >power_off</v-icon>
        </template>
      </v-flex>
      <v-flex xs12 md4 style="text-align: center; padding: 12px;">
        <template v-if="!!state.connected">
          <v-icon
              title="Connected"
              class="indicator"
          >cloud</v-icon>
        </template>
        <template v-else>
          <v-icon
              title="Disconnected"
              class="indicator"
          >cloud_off</v-icon>
        </template>
      </v-flex>
    </v-layout>
    <v-container grid-list-xl>
      <v-layout>
        <v-flex xs12 md3>
          <v-select
              label = "Mode"
              :items="modes"
              v-model="state.mode"
              @change="onChangeMode"
          ></v-select>
        </v-flex>
        <v-flex xs12 md9>
          <v-slider v-if="state.mode <= 1"
              thumb-label="always"
              v-model="state.target"
              :disabled="!state.target"
              @change="onChangeTarget"
          ></v-slider>
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
        this.$bus.$on($consts.EVENTS.UBUS_MESSAGE, (type, data) => {
            if (this.isHold) return;

            switch (type) {
            case 'thermostat-state':
                this.state = JSON.parse(data);
                break;
            }
        });
        this.refreshState();
    },
    computed: {
    },
    methods: {
        refreshState () {
            this.$bus.$emit($consts.EVENTS.UBUS_MESSAGE, 'tmst-refresh-state');
        },
        flushData () {
            if (this.isHold) { clearTimeout(this.isHold); }
            this.isHold = setTimeout(() => {
                this.isHold = null;
                this.refreshState();
            }, 1000);
        },
        onChangeTarget (val) {
            this.$bus.$emit($consts.EVENTS.UBUS_MESSAGE, 'tmst-set-target', val);
            this.flushData();
        },
        onChangeMode (val) {
            this.$bus.$emit($consts.EVENTS.UBUS_MESSAGE, 'tmst-set-mode', val);
            this.flushData();
        }
    },
    data () {
        return {
            modes: [
                { text: 'Less then', value: 0 },
                { text: 'More then', value: 1 },
                { text: 'On', value: 2 },
                { text: 'Off', value: 3 }
            ],
            isHold: false,
            state: {
                connected: null,
                mode: null,
                target: null,
                temp: null,
                state: null
            }
        };
    }
};
</script>

<style>

  .current-temp {
    font-size: 64px;
    text-align: center;
  }

  .indicator {
    font-size: 64px;
  }

</style>
