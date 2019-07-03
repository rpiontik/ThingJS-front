<template>
  <v-container class="custom_container" fill-width >
      <v-stepper v-model="step" style="max-width: 1065px; margin: auto">
          <v-stepper-header>
              <v-stepper-step step="1" :complete="step > 1" :style="step>1?{cursor: 'pointer'}:{}" @click.native="step>1 ? step=1:null;">{{'INTRODUCTION' | lang}}</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step step="2" :complete="step > 2" :style="step>2?{cursor: 'pointer'}:{}" @click.native="step>2 ? step=2:null;">{{'DATE_TIME' | lang}}</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step step="3" :complete="step > 3" :style="step>3?{cursor: 'pointer'}:{}" @click.native="step>3 ? step=3:null;">{{'NETWORK' | lang}}</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step step="4" :complete="step > 4" :style="step>4?{cursor: 'pointer'}:{}" @click.native="step>4 ? step=4:null;">{{'DISPLAY_TITLE' | lang}}</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step step="5" :complete="step == 5" @click.native="step>5 ? step=5:null;">{{'READY' | lang}}</v-stepper-step>
          </v-stepper-header>
          <v-stepper-items>
              <v-stepper-content class="custom_stepper_content" step="1">
                  <v-card class="mb-2 step-card" style="padding: 24px;">
                      <div v-html="htmlHello"></div>
                      <v-select
                              style="position: absolute; right: 16px; top:16px; width: 160px;"
                              :label="'LANGUAGE' | lang"
                              v-model="lang"
                              :items="languages"
                              required
                      ></v-select>
                  </v-card>
                  <router-link :to="{name:'Dashboard'}" style="text-decoration: none">
                    <v-btn flat >{{'CANCEL' | lang}}</v-btn>
                  </router-link>
                  <v-btn color="primary" @click.native="goToPage('lang', 2)">{{'CONTINUE' | lang}}</v-btn>
              </v-stepper-content>
              <v-stepper-content class="custom_stepper_content" step="2">
                  <DateTimeComponent ref="pageDateTime" :lazyValidation="false" class="mb-2 step-card" :float="true" :hide-actions="true"></DateTimeComponent>
                  <v-btn flat @click.native="goToPage(null, 1)">{{'BACK' | lang}}</v-btn>
                  <v-btn color="primary" @click.native="goToPage($refs.pageDateTime, 3)">{{'CONTINUE' | lang}}</v-btn>
              </v-stepper-content>
              <v-stepper-content class="custom_stepper_content" step="3">
                  <NetworkComponent ref="pageNetwork" :lazyValidation="false" v-model="is_valid_network" class="mb-2 step-card" :hide-actions="true"></NetworkComponent>
                  <v-btn flat @click.native="goToPage(null, 2)">{{'BACK' | lang}}</v-btn>
                  <v-btn color="primary" :disabled="!is_valid_network" @click.native="goToPage($refs.pageNetwork, 4)">{{'CONTINUE' | lang}}</v-btn>
              </v-stepper-content>
              <v-stepper-content class="custom_stepper_content" step="4">
                  <DisplayComponent ref="pageDisplay" :lazyValidation="false" class="mb-2 step-card" :hide-actions="true"></DisplayComponent>
                  <v-btn flat @click.native="goToPage(null, 3)">{{'BACK' | lang}}</v-btn>
                  <v-btn color="primary" @click.native="goToPage($refs.pageDisplay, 5)">{{'CONTINUE' | lang}}</v-btn>
              </v-stepper-content>
              <v-stepper-content class="custom_stepper_content" step="5">
                  <div v-html="htmlDone"></div>
                  <v-btn flat @click.native="goToPage(null, 4)">{{'BACK' | lang}}</v-btn>
                  <v-btn color="primary" @click.native="$router.push('/');">{{'BEGIN_WORK' | lang}}</v-btn>
              </v-stepper-content>
          </v-stepper-items>
      </v-stepper>
  </v-container>
</template>

<script>

import NetworkComponent from './settings/Network.vue';
import DisplayComponent from './settings/Display.vue';
import DateTimeComponent from './settings/DateTime.vue';
import Consts from 'consts'

export default {
  name: 'Settings',
  components : {
      NetworkComponent : NetworkComponent,
      DisplayComponent : DisplayComponent,
      DateTimeComponent : DateTimeComponent
  },
  computed : {
      htmlHello(){
          return Vue.filter('lang')('CONFIG_HELPER_HELLO');
      },
      htmlDone(){
          return Vue.filter('lang')('CONFIG_HELPER_READY');
      },
      lang: {
          get(){
              return this.$store.state.display.lang;
          },
          set(value){
              this.$store.commit('setLang', value);
          }
      }
  },
  methods : {
      goToPage(the_page, step) {
          if(the_page === 'lang') {
              this.$store.dispatch('putConfiguration', {
                  display : {
                      lang : "" + this.$store.state.display.lang
                  }
              });
          } else if(the_page)
              the_page.submit();
          this.step   = step;
      },
      submit(){
      }
  },
  data () {
    return {
        step: 0,
        languages: Vue.filter('lang')('AVAILABLE'),
        is_valid_network    : false
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

    .step-desc{
        cursor: pointer;
    }

    .step-card {
    }

    @media (max-width: 599px) {
        .custom_stepper_content {
            padding: 0 !important;
        }

        .custom_container {
            padding: 0 !important;
        }
    }

</style>
