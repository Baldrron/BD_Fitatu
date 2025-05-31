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

function redirectProductPage(id_produktu: string, event: MouseEvent) {
  showInfo.value = true
  selectedId.value = id_produktu
  infoX.value = event.clientX
  infoY.value = event.clientY
  const item = selectedProducts.value?.find((i: any) => i.id_produktu === id_produktu)
  if (item) finalStringInfo.value = item.nazwa.toString()
  else infoparagraph.value = 'Not found'
}

function handleClick(event: MouseEvent) {
  const clickedElement = event.target as HTMLElement
  if (clickedElement.id !== 'addinfo' && clickedElement.className !== 'infoButton') {
    showInfo.value = false
  }
}
</script>

<template>
  <div>
    <div v-if="a">
      <div v-if="a === 'sn'">Śniadanie</div>
      <div v-else-if="a === 'ob'">Obiad</div>
      <div v-else>Kolacja</div>

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
      />

      <div>
        <h3>Wybrane produkty:</h3>
        <ul>
          <li v-for="item in selectedProducts" :key="item.id_produktu">
            {{ item.nazwa }} -
            {{ (item.kalorie * getFactor(item.id_produktu)).toFixed(2) }} kcal,
            {{ (item.weglowodany * getFactor(item.id_produktu)).toFixed(2) }} g węglowodanów,
            {{ (item.bialko * getFactor(item.id_produktu)).toFixed(2) }} g białka,
            {{ (item.tluszcze * getFactor(item.id_produktu)).toFixed(2) }} g tłuszczów.

            <div>
              <label>
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
                v-model.number="portions[item.id_produktu]"
              />

              <label>
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
                v-model.number="grams[item.id_produktu]"
              /> g
              <button @click="(e) => redirectProductPage(item.id_produktu, e)" class="infoButton"> INFO </button>
            </div>
          </li>
        </ul>
        <button type="button" @click="updateMealFromDish">Update</button>
      </div>
    </div>


     <div v-if="showInfo" id="addinfo" :style="{ left: infoX + 'px', top: infoY - boxHeight + 'px' }">
      <p id="infoPar">{{ finalStringInfo }}</p>
    </div>
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Failed to load items.</div>
  </div>
</template>

<style scoped>
#addinfo {
  position: absolute;
  background-color: red;
  color: white;
  padding: 5px;
  width: 100px;
  height: 60px;
  border-radius: 4px;
  z-index: 999;
}
</style>
