<template>
  <div>
    <v-card class="fenist-panel">
      <v-card-title primary-title>
        <h1>{{ 'TITLE_FENIST_CLOUD'|lang }}</h1>
      </v-card-title>
    </v-card>
    <v-card class="fenist-panel">
      <v-flex class="pa-2">
          <v-btn large
                 @click="openCloudControl()"
                 :disabled="notReceivedId"
          >
            {{ 'TITLE_TINYLED_CLOUD'|lang }}
          </v-btn>
      </v-flex>
    </v-card>
    <v-card class="fenist-panel">
      <v-card-title primary-title>
        <h4>{{ 'TITLE_FENIST_SENSORS'|lang }}</h4>
      </v-card-title>
      <v-flex>
        <v-chip label outline color="blue" class="ma-2">Count: {{ temperature.cnt }}</v-chip>
        <v-chip label outline color="green" class="ma-2">Min: {{ temperature.min.toFixed(1) + '&#8451' }}</v-chip>
        <v-chip label outline color="black" class="ma-2">Average: {{ temperature.avg.toFixed(1) + '&#8451' }}</v-chip>
        <v-chip label outline color="red" class="ma-2">Max: {{ temperature.max.toFixed(1) + '&#8451' }}</v-chip>
      </v-flex>
    </v-card>
    <v-card class="fenist-panel">
      <v-card-title primary-title>
        <h4>{{ 'TITLE_FENIST_RELAYS'|lang }}</h4>
      </v-card-title>
      <v-flex>
        <v-switch
            v-model="relay1"
            :disabled="notReceivedHw"
            :label="'RELAY1' | lang"
            class="ml-4"
            @change="changeRelayOnline(1)"
        ></v-switch>
        <v-switch
            v-model="relay2"
            :label="'RELAY2' | lang"
            :disabled="notReceivedHw"
            class="ml-4"
            @change="changeRelayOnline(2)"
        ></v-switch>
        <v-switch
            v-model="relay3"
            :label="'RELAY3' | lang"
            :disabled="notReceivedHw"
            class="ml-4"
            @change="changeRelayOnline(3)"
        ></v-switch>
        <v-switch
            v-model="relay4"
            :label="'RELAY4' | lang"
            :disabled="notReceivedHw"
            class="ml-4"
            @change="changeRelayOnline(4)"
        ></v-switch>
      </v-flex>
    </v-card>
  </div>
</template>

<script>
import Template from '../ante/components/settings/Template';
export default {
    name: 'FenistDash',
    components: {Template},
    mounted () {
        this.$bus.$on($consts.EVENTS.UBUS_MESSAGE, (type, config) => {
            if (type === 'lucerna-state-config') {
                let conf = JSON.parse(config);
                this.deviceId = conf.uuid;
                this.notReceivedId = false;
            }
        });
        this.$bus.$on($consts.EVENTS.UBUS_MESSAGE, (type, config) => {
            if (type === 'fenist-state-config') {
                let conf = JSON.parse(config);
                this.inverse = conf.inverse;
                this.frequency = conf.frequency;
                this.relay1 = conf.relay1;
                this.relay2 = conf.relay2;
                this.relay3 = conf.relay3;
                this.relay4 = conf.relay4;
                this.notReceivedHw = false;
            }
        });
        this.$bus.$on($consts.EVENTS.UBUS_MESSAGE, (type, data_) => {
            if (type === 'ds18x20-temp') {
                let data = JSON.parse(data_);
                this.temperature.max = data.Max;
                this.temperature.min = data.Min;
                this.temperature.avg = data.Avg;
                this.temperature.cnt = data.Count;
            }
        });
        this.$bus.$on($consts.EVENTS.WS_STARTED, this.refreshConfigs);
        this.refreshConfigs();
    },
    methods: {
        refreshConfigs () {
            this.$bus.$emit($consts.EVENTS.UBUS_MESSAGE, 'lucerna-get-config', null);
            this.$bus.$emit($consts.EVENTS.UBUS_MESSAGE, 'fenist-get-config', null);
        },
        openCloudControl () {
            window.open('https://tinyled.ru/index.php/ru/upravlenie?action=manage&module=mod_tinyledscheduler&devid=' + this.deviceId, '_blank');
        },
        changeRelayOnline (relay) {
            let state;
            if (relay === 1) state = this.relay1;
            else if (relay === 2) state = this.relay2;
            else if (relay === 3) state = this.relay3;
            else if (relay === 4) state = this.relay4;
            if (state) this.$bus.$emit($consts.EVENTS.UBUS_MESSAGE, 'relay-on', JSON.stringify({ num: relay }));
            else this.$bus.$emit($consts.EVENTS.UBUS_MESSAGE, 'relay-off', JSON.stringify({ num: relay }));
        }
    },
    data () {
        let data = {
            deviceId: '',
            notReceivedId: true,
            notReceivedHw: true,
            temperature: {
                max: 0,
                min: 0,
                avg: 0,
                cnt: 0
            },
            inverse: false,
            frequency: 400,
            relay1: false,
            relay2: false,
            relay3: false,
            relay4: false
        };
        return data;
    }
};
</script>

<style scoped>
  .fenist-panel {
    margin-left: 4px;
    margin-right: 4px;
    margin-bottom: 4px;
    flex-basis: 580px;
    flex-grow: 1;
  }
</style>
