<template>
  <div class="auth-container">
    <form class="auth-form" @submit.prevent="sign">
      <h2>Załóż konto</h2>

      <label for="login">Login</label>
      <input type="text" id="login" v-model="login" required />

      <label for="email">Email</label>
      <input type="text" id="email" v-model="email" required />

      <label for="password">Hasło</label>
      <input type="password" id="password" v-model="password" required />

      <label for="passwordc">Powtórz hasło</label>
      <input type="password" id="passwordc" v-model="passwordc" required />

      <button type="submit">Zarejestruj</button>

      <NuxtLink to="/login" class="form-link">Masz już konto?</NuxtLink>
    </form>
  </div>
</template>

<script setup lang="ts">
import APIFetch from '~/composables/fetchAPI'

const login = ref("")
const email = ref("")
const password = ref("")
const passwordc = ref("")

async function sign() {
  if (password.value !== passwordc.value) {
    alert("Hasła nie są zgodne!")
    return
  }

  const res = await APIFetch("/signin", {
    method: "POST",
    body: JSON.stringify({
      login: login.value,
      email: email.value,
      haslo: password.value,
      stanowisko: false
    }),
  })

  if (res.result) {
    localStorage.setItem('userLog', login.value)
    const isLoggedIn = useCookie<boolean>('isLoggedIn', {
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      path: '/'
    })
    localStorage.setItem('userEmail', email.value)
    isLoggedIn.value = true
    setTimeout(() => navigateTo("/logged"), 100)
  } else {
    console.log(res.result, res.message)
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
