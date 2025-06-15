<template>
  <div id="app">
    <!-- NAVBAR -->
    <header class="navbar">
      <div class="navbar-left">
        <h1>Biedne Fitatu</h1>
      </div>
      <div class="navbar-right">
        <template v-if="!isLoggedIn">
          <button @click="navigateTo('/login')">Zaloguj</button>
          <button @click="navigateTo('/signin')">Zarejestruj</button>
        </template>
        <template v-else>
          <div
            class="dropdown-wrapper"
            @mouseenter="openDropdown"
            @mouseleave="closeDropdown"
          >
            <button class="dropdown-button">{{ username }}</button>
            <div v-if="dropdown" class="dropdown-menu">
              <a @click="navigateTo('/logged')">Twoja Strona</a>
              <a @click="logout">Wyloguj</a>
            </div>
          </div>
        </template>
      </div>
    </header>

    <!-- LOADER -->
    <div class="loader" v-if="loading">
      <img id="loadGif" src="/images/load.gif" alt="loading"/>
      <br>
      <h1>Ładowanie danych...</h1>
    </div>

    <!-- PAGE CONTENT -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const isLoggedIn = useCookie<boolean>('isLoggedIn')
const username = ref('')
const dropdown = ref(false)
const loading = ref(true)

onMounted(() => {
  username.value = localStorage.getItem('userLog') || ''
  setTimeout(() => {
    loading.value = false
  }, 3000)
})

let leaveTimer: NodeJS.Timeout | null = null

function openDropdown() {
  if (leaveTimer) clearTimeout(leaveTimer)
  dropdown.value = true
}

function closeDropdown() {
  leaveTimer = setTimeout(() => {
    dropdown.value = false
  }, 200)
}

function logout() {
  useCookie('isLoggedIn').value = 'false'
  localStorage.setItem('userLog', '')
  localStorage.setItem('userEmail', '')
  navigateTo('/')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500&display=swap');

#loadGif{
  width: 100px;
  height: 100px;
}

html,
body {
  margin: 0;
  padding: 0;
  background-color: #111;
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  height: 100%;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  background-image: url('/images/Stickworld_seson1.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
  overflow-x: hidden;
}

/* NAVBAR */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.7);
  border-bottom: 1px solid #0f0;
}

.navbar h1 {
  font-size: 1.5rem;
  color: #00ffae;
  text-shadow: 0 0 10px #00ffae;
}

.navbar-right button {
  margin-left: 1rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(rgb(33, 41, 32), rgb(16, 165, 16));
  border: none;
  border-radius: 4px;
  color: azure;
  cursor: pointer;
  font-family: 'Orbitron', sans-serif;
  transition: 0.3s;
}
.navbar-right button:hover {
  box-shadow: 0 0 10px #0f0;
}

/* DROPDOWN */
.dropdown-wrapper {
  position: relative;
  display: inline-block;
}
.dropdown-button {
  background: linear-gradient(rgb(33, 41, 32), rgb(16, 165, 16));
  border: none;
  border-radius: 4px;
  color: azure;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-family: 'Orbitron', sans-serif;
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #222;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 0.5rem;
  margin-top: 0.2rem;
  z-index: 100;
  display: flex;
  flex-direction: column;
}
.dropdown-menu a {
  color: #0f0;
  text-decoration: none;
  padding: 0.3rem 0;
  cursor: pointer;
  transition: 0.2s;
}
.dropdown-menu a:hover {
  color: #fff;
  text-shadow: 0 0 5px #0f0;
}

/* LOADER */
.loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeOut 1.5s forwards 2s;
}
.loader h1 {
  color: #00ffae;
  font-size: 2rem;
  animation: pulseGlow 1.5s infinite;
}

@keyframes pulseGlow {
  0%,
  100% {
    text-shadow: 0 0 10px #0f0, 0 0 20px #0f0;
  }
  50% {
    text-shadow: 0 0 5px #0f0, 0 0 10px #0f0;
  }
}

@keyframes fadeOut {
  to {
    opacity: 0;
    visibility: hidden;
  }
}
</style>
