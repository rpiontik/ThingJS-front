<template>
  <v-container style="min-height: 100%; position: relative">
    <v-container v-if="!startedApp" class="ante-applist">
      <div
        class="ante-app-card"
        v-for="(app) in appList"
        @click="runApplication(app)"
      >
        <img v-if="app.favicon && app.favicon.length" :src="app.favicon" class="ante-app-ico">
        <v-icon v-else class="ante-app-ico" color="grey" large>extension</v-icon>
        <div class="ante-app-title">{{app.name}}</div>
      </div>
    </v-container>
    <component v-else
               :is="startedApp.componentName"
               :key="startedApp.componentName"
               :style="panelStyle"
    ></component>
  </v-container>
</template>

<script>
export default {
  name: 'ThingJS',
  mounted () {
    this.$bus.$on($consts.EVENTS.DO_CLOSE_APPLICATION, () => {
      this.targetApp = null;
    });
  },
  computed: {
    startedApp () {
      if (this.appList.length === 1) {
        this.$store.dispatch('$launcher/registerCurrentApplication', this.appList[0]);
      }
      return this.$store.state.$launcher.currentApplication;
    },
    appList () {
      let result = [];
      $getComponentBy('thingjs.intent.category.LAUNCH', 'thingjs.intent.action.MAIN', (componentName, component, profile) => {
        result.push({
          componentName,
          name: profile.name,
          favicon: profile.favicon
        });
      });
      return result;
    },
    panelStyle () {
      if (this.isMobileScreen) {
        return {
          width: '100%'
        };
      } else {
        return {
          // width   : this.panel_width + 'px'
        };
      }
    }
  },
  methods: {
    runApplication (app) {
      this.$store.dispatch('$launcher/registerCurrentApplication', app);
    }
  },
  data () {
    return {
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1, h2 {
    font-weight: normal;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }

  .ante-applist {
    width: 100%;
  }

  .ante-app-card {
    cursor: pointer;
    display: block;
    float: left;
    margin: 4px;
    width: 64px;
    height: 90px;
  }

  .ante-app-ico {
    width: 64px;
    height: 64px;
    display: flex;
    font-size: 64px !important;
  }

  .ante-app-title {
    display: block;
    width: 100%;
    height: 26px;
    padding-top: 4px;
    text-align: center;
  }
</style>
