<template>
  <button v-if="isAdmin" class="admin-btn" @click="showAdmin = true">Panel Admina</button>
  <div class="page-wrapper">
    <!-- FORMULARZ USTAWIANIA CELU -->
    <form v-if="!result" @submit.prevent="createGoal" class="goal-form">
      <h2>Ustaw swój cel kaloryczny</h2>

      <label>Waga (kg)</label>
      <input type="number" v-model="SW" required />

      <label>Wzrost (cm)</label>
      <input type="number" v-model="SH" required />

      <label>Wiek</label>
      <input type="number" v-model="startW" required />

      <label>Waga docelowa (kg)</label>
      <input type="number" v-model="GW" required />

      <label>Czas (dni)</label>
      <input type="number" v-model="TW" required />

      <label>Płeć</label>
      <select v-model="selectedPlec" required>
        <option disabled value="">-- Wybierz --</option>
        <option v-for="plec in plci" :key="plec">{{ plec }}</option>
      </select>

      <label>Aktywność</label>
      <select v-model="selectedActiv" required>
        <option disabled value="">-- Wybierz --</option>
        <option v-for="opt in options" :key="opt">{{ opt }}</option>
      </select>

      <div v-if="warning" class="warning-msg">
        ⚠️ Ten cel może być niezdrowy!
      </div>

      <button type="submit">Ustaw cel</button>
    </form>

    <!-- PROGRESS -->
    <div v-else class="progress-section">
      <h2>Postęp dzienny</h2>
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: progressPercent + '%', backgroundColor: progressColor }" />
      </div>
      <p>{{ consumedCalories }} / {{ goalCalories }} kcal</p>
      
      <div class="meal-buttons">
        <button @click="() => showMeal('sn')">Śniadanie</button>
        <button @click="() => showMeal('ob')">Obiad</button>
        <button @click="() => showMeal('ko')">Kolacja</button>
      </div>
  </div>
  <div>
  <!-- MODAL -->
      <transition name="fade">
        <div v-if="showPanel" class="modal-backdrop" @click="showPanel = false"></div>
      </transition>
      <transition name="slide-up">
        <div v-if="showPanel" class="modal-panel">
          <button class="close-btn" @click="showPanel = false">Zamknij</button>
          <iframe src="/dish1" />
        </div>
      </transition>
    </div>
    
    <transition name="slide-left">
      <div v-if="showAdmin" class="admin-panel">
        <button class="close-btn" @click="showAdmin=false">Zamknij</button>
        <iframe src="/admin" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import APIFetch from '~/composables/fetchAPI'


const result = ref(false)
const warning = ref(false)
const logEmail = ref('')
const consumedCalories = ref(0)
const goalCalories = ref(2000)

const SW = ref(0) // start weight
const SH = ref(0) // height
const startW = ref(0) // age
const GW = ref(0) // goal weight
const TW = ref(0) // time
const selectedPlec = ref('')
const selectedActiv = ref('')
const showPanel = ref(false)

const options = ['Mało Aktywny', 'Aktywny', 'Bardzo Aktywny']
const plci = ['Mężczyzna', 'Kobieta']

const isAdmin = ref(false)
const showAdmin = ref(false)

const progressPercent = computed(() =>
  Math.min((consumedCalories.value / goalCalories.value) * 100, 100)
)

const progressColor = computed(() => {
  const percent = progressPercent.value
  if (percent < 50) return '#f44336'
  if (percent < 90) return '#ff9800'
  if (consumedCalories.value > goalCalories.value + 150) return '#f44336'
  return '#4caf50'
})

function updateCaloriesFromLocalStorage(event: MessageEvent) {
  if (event.data?.type !== 'updateCalories') return
  const email = localStorage.getItem('userEmail')
  if (!email) return

  const meals = ['sn', 'ob', 'ko']
  let total = 0
  for (const meal of meals) {
    const val = localStorage.getItem(`calories_${email}_${meal}`)
    if (val) total += parseFloat(val)
  }
  consumedCalories.value = total
}

onMounted(async () => {
  const storedEmail = localStorage.getItem('userEmail')
  const storedGoal = localStorage.getItem('goalCal')
  
  const response = await APIFetch('/admin', {
      method: "POST",
      body: JSON.stringify({ email: storedEmail })
    })
  isAdmin.value=response
  

  if (storedGoal) goalCalories.value = parseFloat(storedGoal)
  if (storedEmail) {
    logEmail.value = storedEmail
    const res = await APIFetch('/goal', {
      method: 'POST',
      body: JSON.stringify({ email: storedEmail }),
    })
    result.value = res.ok
    goalCalories.value = res.cal
  }

  window.addEventListener('message', updateCaloriesFromLocalStorage)
  updateCaloriesFromLocalStorage({ data: { type: 'updateCalories' } } as MessageEvent)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', updateCaloriesFromLocalStorage)
})

async function createGoal() {
  let BMI = (10 * SW.value) + (6.25 * SH.value) - (5 * startW.value)
  BMI += selectedPlec.value === 'Mężczyzna' ? 5 : -161

  switch (selectedActiv.value) {
    case 'Mało Aktywny': BMI *= 1.375; break
    case 'Aktywny': BMI *= 1.55; break
    case 'Bardzo Aktywny': BMI *= 1.725; break
  }

  const target = BMI - ((SW.value - GW.value) * 7700) / TW.value
  if (target < BMI - 1000 || (SW.value - GW.value)<0) {
    warning.value = true
    return
  }

  await APIFetch('/setgoal', {
    method: 'POST',
    body: JSON.stringify({
      email: localStorage.getItem('userEmail'),
      newGoal: target,
    }),
  })

  localStorage.setItem('goalCal', target.toString())
  goalCalories.value = target
  result.value = true
}

function showMeal(meal: string) {
  localStorage.setItem('dish', meal)
  showPanel.value = true
}

watch(showPanel, val => {
  document.body.style.overflow = val ? 'hidden' : ''
})
</script>

<style scoped>
.progress-section {
  max-width: 600px;
  margin: auto;
  text-align: center;

  background: rgba(255, 255, 255, 0.15);      /* semi-transparent white */
  backdrop-filter: blur(10px);                 /* blur effect behind */
  border-radius: 12px;                         /* rounded corners */
  padding: 2rem;                              /* some padding inside */
  box-shadow: 0 0 10px #00ff8033;             /* subtle glowing shadow */
  color: white;                               /* keep text white */
}


.page-wrapper {
  padding: 2rem;
  color: white;
}

.goal-form {
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  margin: auto;
  box-shadow: 0 0 10px #00ff8033;
}

.goal-form input,
.goal-form select {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 8px;
  background-color: #2a2a2a;
  color: white;
  border: 1px solid #444;
}

.goal-form button {
  background-color: #00e676;
  padding: 0.6rem;
  border-radius: 8px;
  color: black;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
}

.warning-msg {
  color: red;
  font-weight: bold;
  margin-top: 1rem;
}

.progress-section {
  max-width: 600px;
  margin: auto;
  text-align: center;
}

.progress-container {
  background-color: #333;
  border-radius: 12px;
  overflow: hidden;
  height: 24px;
  margin: 1rem 0;
}

.progress-bar {
  height: 100%;
  transition: width 0.4s ease;
}

.meal-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.meal-buttons button {
  background-color: #4caf50;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  border: none;
}

/* DOWN PANEL */

.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 40;
}

.modal-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 66%;
  background-color: white;
  z-index: 50;
  padding: 1rem;
  overflow-y: auto;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.modal-panel iframe {
  width: 100%;
  height: 90%;
  border: none;
}

.close-btn {
  float: right;
  background: none;
  border: none;
  color: #444;
  font-size: 1rem;
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0);
}

/* ADMIN PANEL */

.admin-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 30%;
  height: 100%;
  background-color: white;
  z-index: 100;
  padding: 1rem;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

.admin-panel iframe {
  width: 100%;
  height: 95%;
  border: none;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
.slide-left-enter-to,
.slide-left-leave-from {
  transform: translateX(0);
}

.admin-btn {
  position: fixed;
  top: 2rem;
  left: 47%;
  background-color: #00bcd4;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  z-index: 500;
  border: none;
  align-self: center;
}
</style>
