<template>
<div>
    <form @submit.prevent="sign">
      <label for="login">Login</label>
      <input type="text" required v-model="login" />
      <label for="email">Email</label>
      <input type="text" required v-model="email" />
      <label for="password">Password</label>
      <input type="password" required v-model="password" />
      <label for="passwordc">Repeat Password</label>
      <input type="password" required v-model="passwordc" />
      <button type="submit">Sign in</button>
    </form>
    <a href="/login">Already signed in?</a>
  </div>
</template>
<script lang="ts">
import APIFetch from '../composables/fetchAPI';


export default {
  data() {
    return {
      login: "",
      email: "",
      password: "",
      passwordc: "",
    };
  },
  methods: {
    async sign() {
      if (this.password != this.passwordc && this.password.length > 0) {
        return "Passwords don't match!";
      }

      const res = await APIFetch("/signin", {
        method: "POST",
        body: JSON.stringify({
          login: this.login,
          email: this.email,
          haslo: this.password,
        }),
      });
      if (res.result) {
        console.log(res.result)
        const isLoggedIn = useCookie<boolean>('isLoggedIn', {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            sameSite: 'lax',
            path: '/'
        })
        localStorage.setItem('userEmail', this.email)
        isLoggedIn.value = true
        setTimeout(() => {
          navigateTo("/logged")
        }, 100)
      }
      else{
        console.log(res.result, res.message);
      }
    },
  },
};
</script>