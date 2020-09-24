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
    <v-tabs
        centered
        icons-and-text
    >
      <v-tab href="#tab-1">
        {{ 'CONTROL'|lang }}
        <v-icon>dashboard</v-icon>
      </v-tab>

      <v-tab href="#tab-2">
        {{ 'CLOUD'|lang }}
        <v-icon>cloud</v-icon>
      </v-tab>

      <v-tab-item value="tab-1">
        <v-container>
          <v-layout>
            <v-flex class="current-temp" xs12 md4>
                <span>
                  <template v-if="state.temp !== null">
                    {{ state.temp.toFixed(1) }}°
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
                >power
                </v-icon>
              </template>
              <template v-else-if="state.state === 0">
                <v-icon
                    title="Power off"
                    class="indicator"
                >power_off
                </v-icon>
              </template>
            </v-flex>
            <v-flex xs12 md4 style="text-align: center; padding: 12px;">
              <template v-if="!!state.connected">
                <v-icon
                    title="Connected"
                    class="indicator"
                >cloud
                </v-icon>
              </template>
              <template v-else>
                <v-icon
                    title="Disconnected"
                    class="indicator"
                >cloud_off
                </v-icon>
              </template>
            </v-flex>
          </v-layout>
        </v-container>
        <v-container grid-list-xl>
          <v-layout>
            <v-flex xs12 md3>
              <v-select
                  label="Mode"
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
      </v-tab-item>
      <v-tab-item value="tab-2">
        <v-container>
          <p>
            Android applications:
            <ul>
              <li><a href="https://play.google.com/store/apps/details?id=net.routix.mqttdash&hl=ru&pli=1" target="_blank">MQTT Dash (RUS)</a></li>
              <li><a href="https://play.google.com/store/apps/details?id=snr.lab.iotmqttpanel.prod&hl=ru" target="_blank">IoT MQTT Panel (EN)</a></li>
            </ul>
          </p>
          <p>
            Server params:
            <ul>
              <li>Address: mqtt.eclipse.org</li>
              <li>port: 1883</li>
            </ul>
          </p>
          <table class="topic-table">
            <tr>
              <th>{{ 'TOPIC'|lang }}</th>
              <th>{{ 'TOPIC_DESCRIPTION'|lang }}</th>
            </tr>
            <tr>
              <td>/thingjs/{{ state.chip_id }}/temp</td>
              <td>{{ 'TOPIC_TEMP_DESC'|lang }}</td>
            </tr>
            <tr>
              <td>/thingjs/{{ state.chip_id }}/state</td>
              <td>{{ 'TOPIC_STATE_DESC'|lang }}</td>
            </tr>
            <tr>
              <td>/thingjs/{{ state.chip_id }}/target/out</td>
              <td>{{ 'TOPIC_TARGET_OUT'|lang }}</td>
            </tr>
            <tr>
              <td>/thingjs/{{ state.chip_id }}/target/in</td>
              <td>{{ 'TOPIC_TARGET_IN'|lang }}</td>
            </tr>
            <tr>
              <td>/thingjs/{{ state.chip_id }}/mode/out</td>
              <td>{{ 'TOPIC_MODE_OUT'|lang }}</td>
            </tr>
            <tr>
              <td>/thingjs/{{ state.chip_id }}/mode/in</td>
              <td>{{ 'TOPIC_MODE_IN'|lang }}</td>
            </tr>
          </table>
        </v-container>
      </v-tab-item>
    </v-tabs>
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
    computed: {},
    methods: {
        refreshState () {
            this.$bus.$emit($consts.EVENTS.UBUS_MESSAGE, 'tmst-refresh-state');
        },
        flushData () {
            if (this.isHold) {
                clearTimeout(this.isHold);
            }
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
                {text: 'Less then', value: 0},
                {text: 'More then', value: 1},
                {text: 'On', value: 2},
                {text: 'Off', value: 3}
            ],
            isHold: false,
            state: {
                connected: null,
                mode: null,
                target: null,
                temp: null,
                state: null,
                chip_id: null
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

.topic-table {
  border-spacing: 0;
}

.topic-table td {
  padding: 4px;
  border-top: solid 1px #fff;
}

</style>
