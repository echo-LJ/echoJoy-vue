<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'app',
  components: {
    HelloWorld
  },
  created () {
    this.getLoginInfo();
  },
  methods: {
    getLoginInfo () {
      console.log(22)
      this.$api.getLoginInfo().then((response) => {
        console.log(22, response)
        if (response.errno === 10000) {
          console.log(22, response)
          if (response.data.status === 'loggedOut') {
            // 当前是登出状态，需要跳到erp去登陆。
            const currenHref = window.location.href;
            window.location.href = this.Config.LOGIN_URL + window.location.href;
          } else if (response.data.status === 'loggedIn') {
            this.getFilterTicket();
            this.getListPermissions();
            this.$store.commit('GET_USER', response.data);
            this.$store.commit('GET_ADMIN', response.data.isAdmin);
          }
        }
      });
    },
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
