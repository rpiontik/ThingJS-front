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
        <v-subheader class="pl-3">{{ 'TITLE_FENIST_SENSORS'|lang }}</v-subheader>
        <v-chip label outline color="blue" class="ml-2 mb-2">{{ 'QTY'|lang }} {{ temperature.cnt }}</v-chip>
        <v-chip label outline color="green" class="mb-2">{{ 'MIN'|lang }} {{ temperature.min.toFixed(1) + '&#8451;' }}</v-chip>
        <v-chip label outline color="black" class="mb-2">{{ 'AVG'|lang }} {{ temperature.avg.toFixed(1) + '&#8451;' }}</v-chip>
        <v-chip label outline color="red" class="mb-2">{{ 'MAX'|lang }} {{ temperature.max.toFixed(1) + '&#8451;' }}</v-chip>
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
            frequency: 400
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
