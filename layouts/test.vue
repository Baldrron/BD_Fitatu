<script lang="ts" setup>
const isLoggedIn = useCookie<boolean>('isLoggedIn')
console.log(isLoggedIn.value)
// Optional: default it to false if undefined
if (typeof isLoggedIn.value === 'undefined') {
  isLoggedIn.value = false
}
</script>
<template>
    <div>
    <div v-if="!isLoggedIn">
    <NuxtLink to="/login">Login</NuxtLink>
    <NuxtLink to="/signin">Sign In</NuxtLink>
    </div>
    <div v-if="isLoggedIn">
    <button @click="logout">Wyloguj</button>
    </div>
        <slot />
    </div>
</template>
<style>
 footer{text-align:center;}
</style>
<script lang="ts">
    async function logout() {
        const isLoggedIn = useCookie<boolean>('isLoggedIn')
        isLoggedIn.value=false
        const userLog = useCookie<string>('emailUser')
        userLog.value=""
        localStorage.removeItem('userEmail')
        navigateTo("/")
    }
</script>