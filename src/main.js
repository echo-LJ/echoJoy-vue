import Vue from 'vue'
import App from './App.vue'
import EchojoyUI from "echojoy-ui";
import "echojoy-ui/lib/echojoy-ui.css";
Vue.use(EchojoyUI);
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
