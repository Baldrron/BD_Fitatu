<template>
  <div class="p-6 max-w-4xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold">Panel administratora</h1>

    <!-- Wybór typu encji -->
    <label class="block font-semibold">Wybierz typ:</label>
    <select v-model="selectedType" class="border p-2 rounded w-full">
      <option disabled value="">-- Wybierz --</option>
      <option value="produkt">Produkt</option>
      <option value="posilek">Posiłek</option>
      <option value="uzytkownik">Użytkownik</option>
    </select>

    <!-- Renderowanie formularza -->
    <div v-if="selectedType === 'produkt'">
      <AdminProdukt />
    </div>
    <div v-else-if="selectedType === 'posilek'">
      <AdminPosilek />
    </div>
    <div v-else-if="selectedType === 'uzytkownik'">
      <AdminUzytkownik />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AdminProdukt from './AdminProdukt.vue';
import AdminPosilek from './AdminPosilek.vue';
import AdminUzytkownik from './AdminUzytkownik.vue';
definePageMeta({ layout: 'test' })

const isAdmin = ref(false)

const selectedType = ref<string>('');
</script>