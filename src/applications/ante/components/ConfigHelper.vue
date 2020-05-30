<template>
    <v-container class="custom_container" fill-width>
        <v-stepper style="max-width: 1065px; margin: auto" v-model="step">
            <v-stepper-header>
                <v-stepper-step :complete="step > 1" :style="step>1?{cursor: 'pointer'}:{}" @click.native="step>1 ? step=1:null;"
                                step="1">{{'INTRODUCTION' | lang}}
                </v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step :complete="step > 2" :style="step>2?{cursor: 'pointer'}:{}" @click.native="step>2 ? step=2:null;"
                                step="2">{{'DATE_TIME' | lang}}
                </v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step :complete="step > 3" :style="step>3?{cursor: 'pointer'}:{}" @click.native="step>3 ? step=3:null;"
                                step="3">{{'NETWORK' | lang}}
                </v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step :complete="step > 4" :style="step>4?{cursor: 'pointer'}:{}" @click.native="step>4 ? step=4:null;"
                                step="4">{{'DISPLAY_TITLE' | lang}}
                </v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step :complete="step == 5" @click.native="step>5 ? step=5:null;" step="5">{{'READY' |
                    lang}}
                </v-stepper-step>
            </v-stepper-header>
            <v-stepper-items>
                <v-stepper-content class="custom_stepper_content" step="1">
                    <v-card class="mb-2 step-card" style="padding: 24px;">
                        <div v-html="htmlHello"></div>
                        <v-select
                                :items="languages"
                                :label="'LANGUAGE' | lang"
                                required
                                style="position: absolute; right: 16px; top:16px; width: 160px;"
                                v-model="lang"
                        ></v-select>
                    </v-card>
                    <router-link :to="{name:'Dashboard'}" style="text-decoration: none">
                        <v-btn flat>{{'CANCEL' | lang}}</v-btn>
                    </router-link>
                    <v-btn @click.native="goToPage('lang', 2)" color="primary">{{'CONTINUE' | lang}}</v-btn>
                </v-stepper-content>
                <v-stepper-content class="custom_stepper_content" step="2">
                    <DateTimeComponent :float="true" :hide-actions="true" :lazyValidation="false" class="mb-2 step-card"
                                       ref="pageDateTime"></DateTimeComponent>
                    <v-btn @click.native="goToPage(null, 1)" flat>{{'BACK' | lang}}</v-btn>
                    <v-btn @click.native="goToPage($refs.pageDateTime, 3)" color="primary">{{'CONTINUE' | lang}}</v-btn>
                </v-stepper-content>
                <v-stepper-content class="custom_stepper_content" step="3">
                    <NetworkComponent :hide-actions="true" :lazyValidation="false" class="mb-2 step-card"
                                      ref="pageNetwork" v-model="is_valid_network"></NetworkComponent>
                    <v-btn @click.native="goToPage(null, 2)" flat>{{'BACK' | lang}}</v-btn>
                    <v-btn :disabled="!is_valid_network" @click.native="goToPage($refs.pageNetwork, 4)" color="primary">
                        {{'CONTINUE' | lang}}
                    </v-btn>
                </v-stepper-content>
                <v-stepper-content class="custom_stepper_content" step="4">
                    <DisplayComponent :hide-actions="true" :lazyValidation="false" class="mb-2 step-card"
                                      ref="pageDisplay"></DisplayComponent>
                    <v-btn @click.native="goToPage(null, 3)" flat>{{'BACK' | lang}}</v-btn>
                    <v-btn @click.native="goToPage($refs.pageDisplay, 5)" color="primary">{{'CONTINUE' | lang}}</v-btn>
                </v-stepper-content>
                <v-stepper-content class="custom_stepper_content" step="5">
                    <div v-html="htmlDone"></div>
                    <v-btn @click.native="goToPage(null, 4)" flat>{{'BACK' | lang}}</v-btn>
                    <v-btn @click.native="$router.push('/');" color="primary">{{'BEGIN_WORK' | lang}}</v-btn>
                </v-stepper-content>
            </v-stepper-items>
        </v-stepper>
    </v-container>
</template>

<script>

import NetworkComponent from './settings/Network.vue';
import DisplayComponent from './settings/Display.vue';
import DateTimeComponent from './settings/DateTime.vue';

export default {
  name: 'Settings',
  components: {
    NetworkComponent: NetworkComponent,
    DisplayComponent: DisplayComponent,
    DateTimeComponent: DateTimeComponent
  },
  computed: {
    htmlHello () {
      return Vue.filter('lang')('CONFIG_HELPER_HELLO');
    },
    htmlDone () {
      return Vue.filter('lang')('CONFIG_HELPER_READY');
    },
    lang: {
      get () {
        return this.$store.state.display.lang;
      },
      set (value) {
        this.$store.commit('setLang', value);
      }
    }
  },
  methods: {
    goToPage (thePage, step) {
      if (thePage === 'lang') {
        this.$store.dispatch('putConfiguration', {
          display: {
            lang: '' + this.$store.state.display.lang
          }
        });
      } else if (thePage) { thePage.submit(); }
      this.step = step;
    },
    submit () {
    }
  },
  data () {
    return {
      step: 0,
      languages: Vue.filter('lang')('AVAILABLE'),
      is_valid_network: false
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

    .step-desc {
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
