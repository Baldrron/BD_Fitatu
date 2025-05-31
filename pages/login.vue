<script lang="ts">
import APIFetch from '~/composables/fetchAPI';

export default {
  data() {
    return {
      email: "",
      haslo: "",
    };
  },
  methods: {
    async check() {
      const res = await APIFetch("/login", {
        method: "POST",
        body: JSON.stringify({
          email: this.email,
          haslo: this.haslo,
        }),
      });
      console.log(res);
      if (res.result) {
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
    },
  },
};
</script>

<template>
  <div>
    <form @submit.prevent="check">
      <label for="email">Email</label>
      <input type="text" required v-model="email" />
      <label for="Pass">Password</label>
      <input type="password" required v-model="haslo" />
      <button type="submit">Login</button>
    </form>
    <a href="/signin">Don't have an account?</a>
  </div>
</template>