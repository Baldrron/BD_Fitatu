<template>
  <div v-if="isAdmin === true" class="admin-layout">
    <header class="header">
      ADMIN PANEL
    </header>

    <div class="form-container">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import APIFetch from '~/composables/fetchAPI'
const isAdmin=ref(false)
onMounted(async () => {
  const storedEmail = localStorage.getItem('userEmail')
  const response = await APIFetch('/admin', {
      method: "POST",
      body: JSON.stringify({ email: storedEmail })
  })
  isAdmin.value = response
})
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-image: url('/images/load.gif');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 2rem;
  box-sizing: border-box;
  color: white;
}

.header {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 3rem;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
  user-select: none;
}

.form-container {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 2rem 3rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  color: #fff;
}

/* Buttons inside the form container */
.form-container button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.25s ease;
  margin-top: 1rem;
}

.form-container button:hover {
  background-color: #2563eb;
}

.form-container button:active {
  background-color: #1e40af;
}
</style>