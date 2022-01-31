import Vue from "vue";
import App from "./App.vue";
import Autocomplete from "v-autocomplete";
import VueAlert from '@vuejs-pt/vue-alert'
import VueSweetalert2 from 'vue-sweetalert2';
import Popover from 'vue-js-popover';

Vue.use(Autocomplete);
Vue.use(VueAlert);
Vue.use(VueSweetalert2);
Vue.use(Popover);

Vue.config.ignoredElements = ['Row', 'Cell', 'Data'];

new Vue({
  el: "#app",
  render: h => h(App)
});
