<template>
  <v-container class="ante-settings">
      <DateTimeComponent class="ante-settings-panel" :style="panelStyle"></DateTimeComponent>
      <NetworkComponent class="ante-settings-panel" :style="panelStyle"></NetworkComponent>
      <DisplayComponent class="ante-settings-panel" :style="panelStyle"></DisplayComponent>
      <component
              v-for="(pref_comp_name) in customPrefs"
              class="ante-settings-panel"
              :is="pref_comp_name"
              :key="pref_comp_name"
              :style="panelStyle"
      ></component>
      <Applications class="ante-settings-panel" :style="panelStyle"></Applications>
      <Firmware class="ante-settings-panel" :style="panelStyle"></Firmware>
  </v-container>
</template>

<script>

import NetworkComponent from './settings/Network.vue';
import DisplayComponent from './settings/Display.vue';
import DateTimeComponent from './settings/DateTime.vue';
import Applications from './settings/Applications.vue';
import Firmware from './settings/Firmware.vue';
import consts from 'consts';

let PANEL_WIDTH     = 540;
let PANEL_PADDING   = 8;
let APP_PADDING     = 80;

export default {
  name: 'Settings',
  components : {
      NetworkComponent : NetworkComponent,
      DisplayComponent : DisplayComponent,
      DateTimeComponent : DateTimeComponent,
      Applications: Applications,
      Firmware : Firmware
  },
  computed:{
    customPrefs() {
        return $getComponentBy('thingjs.intent.category.PREFERENCE', 'thingjs.intent.action.MAIN');
    },
    panelStyle(){
        if(this.isMobileScreen)
            return {
                width : '100%'
            };
        else {
            return {
                //width   : this.panel_width + 'px'
            };
        }
    }
  },
  data () {
    return {
      valid : false,
      panel_width : 0,
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

    .ante-settings {
        display: flex;
        flex-direction: row;
        flex-wrap:wrap;
        justify-content: space-around;
    }

    .ante-settings-panel {
        display:flex;
        margin-left: 4px;
        margin-right: 4px;
        margin-bottom: 4px;
        flex-basis: 580px;
        flex-grow: 1;
    }

</style>
