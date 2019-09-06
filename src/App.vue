<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
  </div>
</template>


<script>
export default {
  created () {
    this.getLoginInfo();
  },
  methods: {
    getLoginInfo () {
      this.$api.getLoginInfo().then((response) => {
        if (response.errno === 10000) {
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
    }
  }
};
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
