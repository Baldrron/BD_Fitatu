<template>
  <main class="main-content">
    <section class="intro">
      <h2>Witamy w naszej aplikacji</h2>
      <p>Strona ta działa trochę jak fitatu, ale tylko trochę, bo jest na budżecie.</p>
      <p>Miłego używania towarzyszu.</p>
      <img src="/images/borisW.gif" alt="placeholder" />
    </section>
  </main>
</template>

<script setup lang="ts">
// No interactivity needed here, yet.
</script>

<style scoped>
.main-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  min-height: 90vh;
}

.intro {
  background: rgba(15, 15, 15, 0.75);
  border: 2px solid rgba(0, 255, 150, 0.3);
  box-shadow: 0 0 25px rgba(0, 255, 100, 0.2), 0 0 80px rgba(0, 255, 200, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  max-width: 700px;
  transition: all 0.4s ease;
  animation: fadeIn 1s ease-out;
}

.intro:hover {
  transform: scale(1.015);
  box-shadow: 0 0 30px rgba(0, 255, 150, 0.4);
}

.intro h2 {
  font-size: 2rem;
  color: #00ffae;
  text-shadow: 0 0 10px #00ffae;
  animation: pulseGlow 2s infinite;
}

.intro p {
  font-size: 1.1rem;
  color: #ccffe5;
  margin-top: 0.5rem;
}

.intro img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  margin-top: 1rem;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 255, 180, 0.2);
  transition: transform 0.4s ease;
}


@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulseGlow {
  0%, 100% {
    text-shadow: 0 0 10px #0f0, 0 0 20px #0f0;
  }
  50% {
    text-shadow: 0 0 5px #0f0, 0 0 10px #0f0;
  }
}
</style>
