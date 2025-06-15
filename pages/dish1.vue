<script setup lang="ts">


//do zrobienia zostało dodanie nowego i updatowanego posiłku. API updatemeal (powinno działać). Zmiany muszą być zrobione tutaj i w logged.vue


import { ref, onMounted, watch } from 'vue'
import APIFetch from '~/composables/fetchAPI'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'
definePageMeta({ layout: 'empty' })

type MealType = 'sn' | 'ob' | 'ko'
type PortionData = {
  [email: string]: {
    [meal in MealType]?: Record<number, number>
  }
}

const a = ref<MealType | null>(null)
const email = ref<string | null>(null)
const dishName = ref<string>('')

const items = ref<any[]>([])
const error = ref("")
const pending = ref(false)

const selectedProducts = ref<any[]>([])
const portions = ref<Record<number, number>>({})
const units = ref<Record<number, 'portion' | 'gram'>>({})
const grams = ref<Record<number, number>>({})

const products = ref<any[]>([])

const getFactor = (id: number) => {
  if (units.value[id] === 'gram') {
    return (grams.value[id] || 0) / 100
  } else {
    return portions.value[id] || 1
  }
}

const calculateTotalCalories = () => {
  return selectedProducts.value.reduce((sum, item) => {
    return sum + item.kalorie * getFactor(item.id_produktu)
  }, 0)
}

const saveCaloriesToLocalStorageAndNotify = () => {
  if (!email.value || !a.value) return

  const totalCalories = calculateTotalCalories()
  const key = `calories_${email.value}_${a.value}`
  localStorage.setItem(key, totalCalories.toFixed(2))

  window.parent.postMessage({ type: 'updateCalories' }, '*')
}

// WATCHERS
watch(selectedProducts, (newVal) => {
  if (!email.value || !a.value) return

  newVal.forEach(item => {
    if (!portions.value[item.id_produktu]) portions.value[item.id_produktu] = 1
    if (!units.value[item.id_produktu]) units.value[item.id_produktu] = 'portion'
  })

  const key = `selectedProducts_${email.value}_${a.value}`
  localStorage.setItem(key, JSON.stringify(newVal.map(p => p.id_produktu)))

  saveCaloriesToLocalStorageAndNotify()
}, { deep: true })

watch([portions, units, grams], () => {
  if (!email.value || !a.value) return

  const raw = localStorage.getItem('portions')
  const parsed: PortionData = raw ? JSON.parse(raw) : {}
  if (!parsed[email.value]) parsed[email.value] = {}
  parsed[email.value][a.value] = portions.value

  localStorage.setItem('portions', JSON.stringify(parsed))
  localStorage.setItem(`units_${email.value}_${a.value}`, JSON.stringify(units.value))
  localStorage.setItem(`grams_${email.value}_${a.value}`, JSON.stringify(grams.value))

  saveCaloriesToLocalStorageAndNotify()
}, { deep: true })


// ładuje posiłek (działa 100% razy przy założeniu że serwer działa 24/7, ponieważ w scripts jest ten śmieszny skrypt który z użyciem pm2 startuje się zawsze o północy)
// z powodu ograniczeń posiłek będzie dodawany tutaj w jednej z funkcji niżej
const loadMealData = async () => {
  pending.value = true
  try {
    const response = await APIFetch('/todayMeal', {
      method: 'POST',
      body: JSON.stringify({
        email: email.value,
        disha: dishName.value
      }),
    })
    items.value = await response
  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = err.message
    }
  } finally {
    pending.value = false
  }
}
//załadowuje wszystkie produkty
const loadProducts = async () => {
  const response = await APIFetch('/allitem', { method: 'GET' })
  products.value = await response
  return products.value
}

// INIT
onMounted(async () => {
  document.addEventListener('click', handleClick)
  a.value = localStorage.getItem('dish') as MealType | null
  email.value = localStorage.getItem('userEmail')

  switch (a.value) {
    case 'sn': dishName.value = "Śniadanie"; break
    case 'ob': dishName.value = "Obiad"; break
    case 'ko': dishName.value = "Kolacja"; break
  }

  if (email.value && a.value) {
    const raw = localStorage.getItem('portions')
    const parsed: PortionData = raw ? JSON.parse(raw) : {}
    portions.value = parsed[email.value]?.[a.value] || {}

    const unitRaw = localStorage.getItem(`units_${email.value}_${a.value}`)
    const gramRaw = localStorage.getItem(`grams_${email.value}_${a.value}`)
    if (unitRaw) units.value = JSON.parse(unitRaw)
    if (gramRaw) grams.value = JSON.parse(gramRaw)

    await loadProducts()

    const key = `selectedProducts_${email.value}_${a.value}`
    const saved = localStorage.getItem(key)
    if (saved) {
      const ids = JSON.parse(saved)
      selectedProducts.value = products.value.filter(p => ids.includes(p.id_produktu))
    }

    loadMealData()
    saveCaloriesToLocalStorageAndNotify()
  }
   scheduleMidnightReset()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClick)
})

//update posilku
async function updateMealFromDish() {
  const email = localStorage.getItem('userEmail')
  const meal = localStorage.getItem('dish') as MealType | null // 'sn', 'ob', 'ko'
  if (!email || !meal) return

  const portionsRaw = localStorage.getItem('portions')
  if (!portionsRaw) return

  const portionMap: PortionData = JSON.parse(portionsRaw)
  const userMealPortions = portionMap[email]?.[meal] || {}

  const unitRaw = localStorage.getItem(`units_${email}_${meal}`)
  const gramRaw = localStorage.getItem(`grams_${email}_${meal}`)

  const unitsMap: Record<number, 'portion' | 'gram'> = unitRaw ? JSON.parse(unitRaw) : {}
  const gramsMap: Record<number, number> = gramRaw ? JSON.parse(gramRaw) : {}

  const allProducts = await APIFetch('/allitem', { method: 'GET' })

  const getFactor = (id: number) => {
    if (unitsMap[id] === 'gram') {
      return (gramsMap[id] || 0) / 100
    } else {
      return userMealPortions[id] || 1
    }
  }

  let totalK = 0, totalP = 0, totalF = 0, totalC = 0
  const today = new Date().toISOString().split('T')[0]

  for (const product of allProducts) {
    if (userMealPortions[product.id_produktu] != null) {
      const factor = getFactor(product.id_produktu)
      totalK += (product.kalorie || 0) * factor
      totalP += (product.bialko || 0) * factor
      totalF += (product.tluszcze || 0) * factor
      totalC += (product.weglowodany || 0) * factor
    }
  }

  let nameDish = ''
  switch (meal) {
    case 'sn': nameDish = 'Śniadanie'; break
    case 'ob': nameDish = 'Obiad'; break
    case 'ko': nameDish = 'Kolacja'; break
  }

  // zapis lokalny
  localStorage.setItem(`calories_${email}_${meal}`, totalK.toFixed(2))

  const result = await APIFetch('/updatemeal', {
    method: 'POST',
    body: JSON.stringify({
      email,
      date: today,
      data: {
        nazwa: nameDish,
        kalorie: totalK,
        bialko: totalP,
        tluszcze: totalF,
        weglowodany: totalC
      },
    }),
  })

  console.log('Update meal result:', result)
}

//resetowanie wartości

function scheduleMidnightReset() {
  const now = new Date()
  const tomorrow = new Date()
  tomorrow.setHours(24, 0, 0, 0)

  const msUntilMidnight = tomorrow.getTime() - now.getTime()

  setTimeout(() => {
    clearMealLocalStorage()
    scheduleMidnightReset() // Na kolejną północ
  }, msUntilMidnight)
}

function clearMealLocalStorage() {
  const email = localStorage.getItem('userEmail')
  const meal = localStorage.getItem('dish') as MealType | null
  if (!email || !meal) return

  // Czyszczenie
  const portionsRaw = localStorage.getItem('portions')
  if (portionsRaw) {
    const parsed: PortionData = JSON.parse(portionsRaw)
    if (parsed[email]) {
      delete parsed[email][meal]
      localStorage.setItem('portions', JSON.stringify(parsed))
    }
  }

  localStorage.removeItem(`units_${email}_${meal}`)
  localStorage.removeItem(`grams_${email}_${meal}`)
  localStorage.removeItem(`selectedProducts_${email}_${meal}`)
  localStorage.removeItem(`calories_${email}_${meal}`)

  // Reload
  location.reload()
}

const showInfo = ref(false)
const infoX = ref(0)
const infoY = ref(0)
const boxHeight = 60
const selectedId = ref<string | null>(null)
const finalStringInfo = ref('')
const infoparagraph = ref('infoPar')


// jakbym w tabeli produkty miał opis to moznabybyło tutaj zczytywać description
//musze tu jeszcze info poprawić i wszystko będzie działać
function redirectProductPage(id_produktu: string, event: MouseEvent) {
  showInfo.value = true;
  selectedId.value = id_produktu;
 const doc = document.documentElement;

  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()

  infoX.value = rect.left
  infoY.value = rect.top  

  console.log(infoY.value, event.clientY, doc.scrollTop)
  const item = selectedProducts.value?.find((i: any) => i.id_produktu === id_produktu);
  if (item) finalStringInfo.value = item.nazwa.toString();
  else finalStringInfo.value = 'Not found';
}


function handleClick(event: MouseEvent) {
  const clickedElement = event.target as HTMLElement
  if (clickedElement.id !== 'addinfo' && !clickedElement.classList.contains('info-button')) {
  showInfo.value = false;
}
}
</script>

<template>
  <div class="container">
    <div v-if="a" class="meal-section">
      <h2 class="meal-title">{{ dishName }}</h2>

      <Multiselect
        v-model="selectedProducts"
        :options="products"
        :multiple="true"
        :close-on-select="false"
        :clear-on-select="false"
        :preserve-search="true"
        placeholder="Wybierz produkty"
        label="nazwa"
        track-by="id_produktu"
        class="multiselect"
      />

      <section class="selected-products">
        <h3 class="section-title">Wybrane produkty:</h3>
        <ul class="product-list">
          <li v-for="item in selectedProducts" :key="item.id_produktu" class="product-item">
            <div class="product-name">{{ item.nazwa }}</div>
            <div class="product-nutrition">
              {{ (item.kalorie * getFactor(item.id_produktu)).toFixed(2) }} kcal |
              {{ (item.weglowodany * getFactor(item.id_produktu)).toFixed(2) }} g węgli |
              {{ (item.bialko * getFactor(item.id_produktu)).toFixed(2) }} g białka |
              {{ (item.tluszcze * getFactor(item.id_produktu)).toFixed(2) }} g tłuszczy
            </div>

            <div class="product-controls">
              <label class="unit-label">
                <input
                  type="radio"
                  :name="`unit_${item.id_produktu}`"
                  value="portion"
                  v-model="units[item.id_produktu]"
                />
                Porcje
              </label>
              <input
                v-if="units[item.id_produktu] === 'portion'"
                type="number"
                min="1"
                class="unit-input"
                v-model.number="portions[item.id_produktu]"
              />

              <label class="unit-label">
                <input
                  type="radio"
                  :name="`unit_${item.id_produktu}`"
                  value="gram"
                  v-model="units[item.id_produktu]"
                />
                Gramy
              </label>
              <input
                v-if="units[item.id_produktu] === 'gram'"
                type="number"
                min="1"
                class="unit-input"
                v-model.number="grams[item.id_produktu]"
              /> g

              <button
                @click="(e) => redirectProductPage(item.id_produktu, e)"
                class="info-button"
                type="button"
                aria-label="Show product info"
              >
                INFO
              </button>
            </div>
          </li>
        </ul>

        <button
          type="button"
          @click="updateMealFromDish"
          class="save-button"
        >
          Zapisz / Update
        </button>
      </section>
    </div>

    <div
      v-if="showInfo"
      id="addinfo"
      :style="{ left: infoX + 'px', top: infoY - boxHeight + 'px' }"
      class="info-popup"
    >
      <p id="infoPar">{{ finalStringInfo }}</p>
    </div>

    <div v-if="pending" class="status-message">Ładowanie danych...</div>
    <div v-else-if="error" class="error-message">Błąd: {{ error }}</div>
  </div>
</template>

<style scoped>
#app {
  position: relative;
}

.container {
  max-width: 720px;
  margin: 2rem auto;
  padding: 1.5rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.meal-section {
  background: #fefefe;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  padding: 2rem 2.5rem;
}

.meal-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937; /* dark slate */
  margin-bottom: 1.5rem;
  text-align: center;
}

.multiselect {
  margin-bottom: 2rem;
  --vue-multiselect-border-radius: 8px;
  --vue-multiselect-border-color: #cbd5e1;
  --vue-multiselect-placeholder-color: #9ca3af;
}

.selected-products {
  background-color: #f9fafb;
  border-radius: 10px;
  padding: 1.5rem 2rem;
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
  border-bottom: 2px solid #60a5fa;
  padding-bottom: 0.4rem;
}

.product-list {
  list-style: none;
  padding: 0;
  margin-bottom: 1.5rem;
}

.product-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: 0 3px 8px rgba(0,0,0,0.05);
  transition: box-shadow 0.3s ease;
}

.product-item:hover {
  box-shadow: 0 6px 15px rgba(0,0,0,0.1);
}

.product-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 1.1rem;
}

.product-nutrition {
  font-size: 0.9rem;
  color: #4b5563;
  user-select: none;
}

.product-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.unit-label {
  font-size: 0.9rem;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.unit-input {
  width: 60px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.3rem 0.5rem;
  font-size: 0.9rem;
  text-align: center;
  transition: border-color 0.2s ease;
}

.unit-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 5px #3b82f6;
}

.info-button {
  margin-left: auto;
  background-color: #2563eb;
  color: white;
  padding: 0.4rem 0.9rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.info-button:hover {
  background-color: #1e40af;
}

.save-button {
  background-color: #16a34a;
  color: white;
  font-weight: 700;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s ease;
}

.save-button:hover {
  background-color: #15803d;
}

.info-popup {
  position: fixed;
  top: v-bind(infoY + 'px');
  left: v-bind(infoX + 'px');
  z-index: 9999;
  background-color: #111827;
  color: #f9fafb;
  padding: 10px 14px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  white-space: nowrap;
  font-size: 0.9rem;
  user-select: none;
}

.status-message {
  text-align: center;
  font-size: 1rem;
  color: #6b7280;
  margin-top: 2rem;
}

.error-message {
  text-align: center;
  font-size: 1rem;
  color: #dc2626;
  margin-top: 2rem;
}
</style>
