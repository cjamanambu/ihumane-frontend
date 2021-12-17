import Vue from "vue";
import App from "./App.vue";
import BootstrapVue from "bootstrap-vue";
import VueApexCharts from "vue-apexcharts";
import Vuelidate from "vuelidate";
import VueSweetalert2 from "vue-sweetalert2";
import VueMask from "v-mask";
import * as VueGoogleMaps from "vue2-google-maps";
import VueYoutube from "vue-youtube";
import vSelect from "vue-select";

import vco from "v-click-outside";

import router from "./router";
import store from "@/state/store";
import i18n from "./i18n";
import apiService from "@/services/api.service";

import "@/assets/scss/app.scss";

Vue.config.productionTip = false;
Vue.config.silent = true;
Vue.config.errorHandler = function (err, vm, info) {
  console.warn({ err, vm, info });
};
Vue.use(VueYoutube);
Vue.use(BootstrapVue);
Vue.use(vco);
Vue.use(Vuelidate);
Vue.use(VueSweetalert2);
Vue.use(VueMask);
Vue.use(require("vue-chartist"));
Vue.use(VueGoogleMaps, {
  load: {
    key: "AIzaSyAbvyBxmMbFhrzP9Z8moyYr6dCr-pzjhBE",
    libraries: "places",
  },
  installComponents: true,
});
Vue.component("apexchart", VueApexCharts);
Vue.component("v-select", vSelect);
import "vue-select/dist/vue-select.css";
Vue.mixin(apiService);

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount("#app");
