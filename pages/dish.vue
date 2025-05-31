<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import APIFetch from '~/composables/fetchAPI'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'
definePageMeta({ layout: 'empty' })
import type { posilek } from '@prisma/client'

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

const products = ref<any[]>([])
const loadProducts = async () => {
  const response = await APIFetch('/allitem', { method: 'GET' })
  products.value = await response

  // Restore selected products after products are loaded
  if (email.value && a.value) {
    const key = `selectedProducts_${email.value}_${a.value}`
    const saved = localStorage.getItem(key)
    if (saved) {
      const ids = JSON.parse(saved)
      selectedProducts.value = products.value.filter(p => ids.includes(p.id_produktu))
    }
  }
}

onMounted(() => {
  a.value = localStorage.getItem('dish') as MealType | null
  email.value = localStorage.getItem('userEmail')

  switch (a.value) {
    case 'sn': dishName.value = "Śniadanie"; break
    case 'ob': dishName.value = "Obiad"; break
    case 'ko': dishName.value = "Kolacja"; break
  }

  // Restore stored portions
  if (email.value && a.value) {
    const raw = localStorage.getItem('portions')
    const parsed: PortionData = raw ? JSON.parse(raw) : {}
    portions.value = parsed[email.value]?.[a.value] || {}

    loadMealData()
    loadProducts()
  }
})

const selectedProducts = ref<any[]>([])
const portions = ref<Record<number, number>>({})

// Store selected products in localStorage
watch(selectedProducts, (newVal) => {
  if (!email.value || !a.value) return

  // Auto-init portions for newly selected products
  newVal.forEach(item => {
    if (!portions.value[item.id_produktu]) {
      portions.value[item.id_produktu] = 1
    }
  })

  const key = `selectedProducts_${email.value}_${a.value}`
  localStorage.setItem(key, JSON.stringify(newVal.map(p => p.id_produktu)))
}, { deep: true })

// Store portions in localStorage per user and meal
watch(portions, (newVal) => {
  if (!email.value || !a.value) return

  const raw = localStorage.getItem('portions')
  const parsed: PortionData = raw ? JSON.parse(raw) : {}

  if (!parsed[email.value]) parsed[email.value] = {}
  parsed[email.value][a.value] = newVal

  localStorage.setItem('portions', JSON.stringify(parsed))
}, { deep: true })
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
            {{ item.kalorie * portions[item.id_produktu] }} kcal,
            {{ item.weglowodany * portions[item.id_produktu] }} g węglowodanów,
            {{ item.bialko * portions[item.id_produktu] }} g białka,
            {{ item.tluszcze * portions[item.id_produktu] }} g tłuszczów.
            Porcji:
            <input
              type="number"
              min="1"
              v-model.number="portions[item.id_produktu]"
            />
          </li>
        </ul>
      </div>
    </div>

    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Failed to load items.</div>
  </div>
</template>
