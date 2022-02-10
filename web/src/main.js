import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import vuetify from "./plugins/vuetify";
import VueCurrencyInput from 'vue-currency-input'

import Notifications from "./components/Notifications";

Vue.config.productionTip = false;

axios.defaults.withCredentials = true;

Vue.component("notifications", Notifications);

Vue.use(VueCurrencyInput, { globalOptions: { currency: 'USD', locale: 'en' } });

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
