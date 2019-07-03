import Vue from 'vue';
import Vuetify from 'vuetify';
import Vuex from 'vuex';
import Axios from 'axios';
import Root from './Root.vue';
import storage from './storage';
import router from './router';
import EventsBus from './bus.vue';

if(process.env.NODE_ENV === 'production') {
    console.info('%cThingJS: debugger%c(c)', 'color: #1976d2; font-size: 40px;', 'color: #1976d2; font-size: 10px; vertical-align: top;');
    console.info(process.env.BUILD_MOMENT);
}

Vue.use(Vuex);
Vue.use(Vuetify);

window.Vue      = Vue;
window.$store   = new Vuex.Store(storage);
window.$store.dispatch('beginPending');

EventsBus.store = window.$store;
let theBus  = new Vue(EventsBus);

Vue.prototype.$bus              = theBus;
Vue.prototype.$axios            = Axios;
Vuex.Store.prototype.$bus       = theBus;
window.Vue.$bus                 = theBus;
window.$bus                     = theBus;
window.$axios                   = Axios;

new Vue(Object.assign({
    el: '#app',
    router,
    store : window.$store,
}, Root));

setTimeout(() => window.$store.dispatch('endPending'), 50);
