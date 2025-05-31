<script lang="ts">
export default {
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    async loginMove(){
      navigateTo("/signin")
    }
  },
};
</script>
<script lang="ts" setup>
const isLoggedIn = useCookie<boolean>('isLoggedIn')
</script>

<template>
    <div id="main">
      <div id="topBanner">
        <h1>WITAMY NA BIEDNYM FITATU</h1>
      </div>
      <div id="appInfo">
        <p>
          Strona ta działa trochę jak fitatu, ale tylko trochę bo w sumie taka na budżecie jest. Miłego używania towarzyszu.
        </p>
        <button v-on:click="loginMove()" v-if="!isLoggedIn">JOIN US</button>
      </div>
    </div>
</template>

  <style>
  #main{align-content: center;}
  #topBanner{font-family: Verdana; font-size: 30px; text-align: center;}
  #appInfo{margin: auto; width: 200px; text-align: left;}
  button{margin: auto; background-image: linear-gradient(rgb(33, 41, 32), rgb(16, 165, 16)); color: azure; font-size: 30px; border-radius: 2px; border: none; font-family: 'Times New Roman';}
</style>
