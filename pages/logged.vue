<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import APIFetch from '~/composables/fetchAPI'
import { useRoute } from 'vue-router'

definePageMeta({ layout: 'test' })

type MealType = 'sn' | 'ob' | 'ko'
type PortionData = {
  [email: string]: {
    [meal in MealType]?: Record<number, number>
  }
}

const route = useRoute()
const { data: items, pending, error } = useAsyncData(() =>
  APIFetch('/allitem', { method: 'GET' })
)

const logEmail = ref('')
const result = ref(false)
const consumedCalories = ref(0)
const goalCalories = ref(2000)

//przeliczanie na procenty
const progressPercent = computed(() =>
  Math.min((consumedCalories.value / goalCalories.value) * 100, 100)
)

//kolorek progresbara
const progressColor = computed(() => {
  const percent = progressPercent.value
  if (percent < 50) return '#f44336' // red
  else if (percent < 90) return '#ff9800' // orange
  else if (consumedCalories.value>goalCalories.value+150) return '#f44336'
  else return '#4caf50' // green
})

// Obsługa postMessage i aktualizacja kalorii z localStorage
function updateCaloriesFromLocalStorage(event: MessageEvent) {
  if (event.data?.type === 'updateCalories') {
    const email = localStorage.getItem('userEmail')
    if (!email) return

    const meals = ['sn', 'ob', 'ko']
    let total = 0
    for (const meal of meals) {
      const cal = localStorage.getItem(`calories_${email}_${meal}`)
      if (cal) total += parseFloat(cal)
    }
    consumedCalories.value = total
  }
}

//wszystko co się na starcie dzieje
onMounted(async () => {
  if (process.client) {
    const storedEmail = localStorage.getItem('userEmail')
    const storedGoal = localStorage.getItem('goalCal')
    if (storedGoal) goalCalories.value = parseFloat(storedGoal)
    if (storedEmail) {
      logEmail.value = storedEmail
      const res = await APIFetch('/goal', {
        method: 'POST',
        body: JSON.stringify({ email: logEmail.value }),
      })
      result.value = res.ok
      goalCalories.value = res.cal
    }
  }

  window.addEventListener('message', updateCaloriesFromLocalStorage)

  // Załaduj dane od razu przy starcie
  updateCaloriesFromLocalStorage({ data: { type: 'updateCalories' } } as MessageEvent)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', updateCaloriesFromLocalStorage)
})


//tworzenie celu jeśli takowego brak
var warning = false
var SW: number
var GW: number
var TW: number
var SH: number
var startW: number
const options = ['Mało Aktywny', 'Aktywny', 'Bardzo Aktywny']
const plci = ['Mężczyzna', 'Kobieta']
const selectedPlec = ref('')
const selectedActiv = ref('')


async function createGoal() {
  let BMI = (10 * SW) + (6.25 * SH) - (5 * startW)
  BMI += selectedPlec.value === 'Mężczyzna' ? 5 : -161

  switch (selectedActiv.value) {
    case 'Mało Aktywny': BMI *= 1.375; break
    case 'Aktywny': BMI *= 1.55; break
    case 'Bardzo Aktywny': BMI *= 1.725; break
  }

  const TargetCalories = BMI - ((SW - GW) * 7700) / TW
  if (TargetCalories < (BMI - 1000)) {
    warning = true
    return 0
  }

  await APIFetch('/setgoal', {
    method: 'POST',
    body: JSON.stringify({
      email: localStorage.getItem('userEmail'),
      newGoal: TargetCalories,
    }),
  })

  result.value = true
  localStorage.setItem('goalCal', TargetCalories.toString())
  goalCalories.value = TargetCalories
}

//dodatki
const showPanel = ref(false)
watch(showPanel, (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
})

function openDish(name: string) {
  localStorage.setItem('dish', name)
}
</script>

<template>
  <div v-if="!result">
    <form @submit.prevent="createGoal">
      <p>Your weight is: {{ SW }}</p>
      <input type="number" v-model="SW" required />
      <p>Your height is: {{ SH }}</p>
      <input type="number" v-model="SH" required />
      <p>Your age is: {{ startW }}</p>
      <input type="number" v-model="startW" required />
      <p>Goal weight is: {{ GW }}</p>
      <input type="number" v-model="GW" required />
      <p>Time in days: {{ TW }}</p>
      <input type="number" v-model="TW" required />

      <select v-model="selectedPlec" required>
        <option disabled value="">-- Select --</option>
        <option v-for="plec in plci" :key="plec" :value="plec">{{ plec }}</option>
      </select>

      <select v-model="selectedActiv" required>
        <option disabled value="">-- Select --</option>
        <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
      </select>

      <div v-if="warning">WARNING! THIS MAY BE DANGEROUS FOR YOUR HEALTH</div>
      <button type="submit">Create Goal</button>
    </form>
  </div>

  <div v-else>
    <div class="progress-container">
      <div
        class="progress-bar"
        :style="{ width: progressPercent + '%', backgroundColor: progressColor }"
      ></div>
    </div>
    <p>{{ consumedCalories }} / {{ goalCalories }} kcal</p>

    <button @click="showPanel = true; openDish('sn')" name="sn">Śniadanie</button>
    <button @click="showPanel = true; openDish('ob')" name="ob">Obiad</button>
    <button @click="showPanel = true; openDish('ko')" name="ko">Kolacja</button>

    <transition name="fade">
      <div v-if="showPanel" class="fixed inset-0 bg-black bg-opacity-50 z-40" @click="showPanel = false"></div>
    </transition>

    <transition name="slide-up">
      <div
        v-if="showPanel"
        class="fixed bottom-0 left-0 w-full h-2/3 bg-white shadow-lg z-50 p-4 overflow-y-auto"
      >
        <button @click="showPanel = false" class="float-right">Close</button>
        <h2 class="text-xl mb-4">Embedded Page</h2>
        <iframe src="/dish1" class="w-full h-full border-none"></iframe>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.progress-container {
  width: 100%;
  height: 20px;
  background-color: #eee;
  border-radius: 10px;
  overflow: hidden;
  margin: 15px 0;
}
.progress-bar {
  height: 100%;
  transition: width 0.3s ease;
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
  transform: translateY(0%);
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
iframe {
  width: 100%;
  height: 600px;
}
</style>