import Vue from 'vue';
import Vuetify from 'vuetify';
import Vuex from 'vuex';
import router from './router';
import UnionBus from './core/bus.vue';
import storage from './core/storage';
import mixins from './core/mixins';
import Apps from './core/applications';
import Root from './Root.vue';
import Axios from 'axios';
import Cookie from 'vue-cookie';

if (process.env.NODE_ENV === 'production') {
    console.info('%cThingJS%c(c)', 'color: #1976d2; font-size: 40px;', 'color: #1976d2; font-size: 10px; vertical-align: top;');
    console.info('%cЕсли ты васько, сюда не ласько ;)', 'color: #1976d2; font-size: 16px;');
    console.info(process.env.BUILD_MOMENT);
}

window.$consts = require('./core/consts').default;

Vue.use(Vuex);
Vue.use(Vuetify);
Vue.use(Cookie);
Vue.mixin(mixins);

window.Vue = Vue;
Vue.prototype.$axios = Axios;

let UBus = new Vue(UnionBus);
Vue.prototype.$bus = UBus;
Vuex.Store.prototype.$bus = UBus;
window.Vue.$bus = UBus;
window.$bus = UBus;

if (process.env.NODE_ENV === 'development') {
    let DevBus = new Vue(require('./core/dev-bus.vue'));
    Vue.prototype.$dev_bus = DevBus;
    Vuex.Store.prototype.$dev_bus = DevBus;
    window.Vue.$dev_bus = DevBus;
}

window.$store = new Vuex.Store(storage);
window.$axios = Axios;
window.$exportComponent = Apps.exportComponent;
window.$protocomponents = [];
window.$resolvers_components = [];
window.$getComponentBy = Apps.getComponentBy;
window.$includeLang = Apps.includeLang;
window.$requireComponent = Apps.requireComponent;

// Loaded application components storage
window.$applications = {};

// Panding request manager
let pendingRequestsCount = 0;
window.$axios._addPendingRequest = function (url) {
    pendingRequestsCount++;
    console.info('Added pending ', url, pendingRequestsCount);
};

window.$axios._removePendingRequest = function (url) {
    pendingRequestsCount--;
    console.info('Removed pending ', url, pendingRequestsCount);
};

window.$axios._isPendingRequest = function (url) {
    return pendingRequestsCount > 0;
};

Vue.config.productionTip = false;

// Multi Language
Vue.filter('lang', function (value) {
    let lang = window.$store.state.display.lang;

    if (lang in $consts.LANGS && value in $consts.LANGS[lang]) {
        return $consts.LANGS[lang][value];
    } else {
        console.warn('Not found lang const ', value);
        return value;
    }
});

window.$store.dispatch('initData');

// eslint-disable-next-line no-new
new Vue(Object.assign({
    el: '#app',
    router,
    store: window.$store
}, Root));
