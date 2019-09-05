import Vue from 'vue'
import App from './App.vue'
import EchojoyUI from "echojoy-ui";
import "echojoy-ui/lib/echojoy-ui.css";
import api from "@/request/index";
import router from './router'
import store from './store'
Vue.use(EchojoyUI);
Vue.config.productionTip = false


Vue.use(api);
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
