<template>
  <div class="auth-container">
    <form class="auth-form" @submit.prevent="check">
      <h2>Zaloguj się</h2>
      <label for="email">Email</label>
      <input type="text" id="email" v-model="email" required />

      <label for="password">Hasło</label>
      <input type="password" id="password" v-model="haslo" required />

      <button type="submit">Zaloguj</button>

      <NuxtLink to="/signin" class="form-link">Nie masz konta?</NuxtLink>
    </form>
  </div>
</template>

<script setup lang="ts">
import APIFetch from '~/composables/fetchAPI'

const email = ref("")
const haslo = ref("")

async function check() {
  const res = await APIFetch("/login", {
    method: "POST",
    body: JSON.stringify({ email: email.value, haslo: haslo.value }),
  })

  if (res.result) {
    const isLoggedIn = useCookie<boolean>('isLoggedIn', {
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      path: '/'
    })
    localStorage.setItem('userEmail', email.value)
    localStorage.setItem('userLog', res.message)
    isLoggedIn.value = true
    setTimeout(() => window.location.href = '/logged', 100)
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.auth-form {
  display: flex;
  flex-direction: column;
  background: rgba(20, 20, 20, 0.8);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 0 12px #00ff7f33;
  width: 300px;
  color: white;
}

.auth-form input {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #222;
  border: 1px solid #555;
  border-radius: 6px;
  color: white;
}

.auth-form button {
  background: linear-gradient(to right, #0f0, #2f2);
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  color: black;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
}

.form-link {
  margin-top: 1rem;
  color: #0f0;
  text-align: center;
  text-decoration: underline;
}
</style>
