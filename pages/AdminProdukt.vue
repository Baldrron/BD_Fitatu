<template>
  <div class="space-y-4">
    <h2 class="text-xl font-semibold">Zarządzaj produktami</h2>

    <div class="flex gap-2">
      <button @click="action = 'add'" class="btn">Dodaj</button>
      <button @click="action = 'edit'" class="btn">Edytuj</button>
      <button @click="action = 'delete'" class="btn">Usuń</button>
    </div>

    <!-- Dodawanie produktu -->
    <form v-if="action === 'add'" @submit.prevent="addProdukt" class="space-y-2">
      <input v-model="form.nazwa" type="text" placeholder="Nazwa" class="input" required />
      <input v-model.number="form.kalorie" type="number" placeholder="Kalorie" class="input" required />
      <input v-model.number="form.bialko" type="number" placeholder="Białko" class="input" required />
      <input v-model.number="form.tluszcze" type="number" placeholder="Tłuszcze" class="input" required />
      <input v-model.number="form.weglowodany" type="number" placeholder="Węglowodany" class="input" required />
      <button class="btn-primary">Dodaj</button>
    </form>

    <!-- Edycja produktu -->
    <form v-if="action === 'edit'" @submit.prevent="editProdukt" class="space-y-2">
      <input v-model.number="form.id_produktu" type="number" placeholder="ID produktu" class="input" required />
      <input v-model="form.nazwa" type="text" placeholder="Nowa nazwa" class="input" />
      <input v-model.number="form.kalorie" type="number" placeholder="Kalorie" class="input" />
      <input v-model.number="form.bialko" type="number" placeholder="Białko" class="input" />
      <input v-model.number="form.tluszcze" type="number" placeholder="Tłuszcze" class="input" />
      <input v-model.number="form.weglowodany" type="number" placeholder="Węglowodany" class="input" />
      <button class="btn-primary">Zapisz zmiany</button>
    </form>

    <!-- Usuwanie produktu -->
    <form v-if="action === 'delete'" @submit.prevent="deleteProdukt" class="space-y-2">
      <input v-model.number="form.id_produktu" type="number" placeholder="ID produktu" class="input" required />
      <button class="btn-danger">Usuń produkt</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import APIFetch from '~/composables/fetchAPI';

const action = ref('');
const form = ref({
  id_produktu: null,
  nazwa: '',
  kalorie: null,
  bialko: null,
  tluszcze: null,
  weglowodany: null,
});

const addProdukt = async () => {
  const res = await APIFetch('/admin/product', {
    method: 'POST',
    body: JSON.stringify(form.value),
  });
};

const editProdukt = async () => {
  await APIFetch('/admin/product', {
    method: 'PATCH',
    body: JSON.stringify(form.value),
  });
};

const deleteProdukt = async () => {
  await APIFetch('/admin/product', {
    method: 'DELETE',
    body: JSON.stringify({ id: form.value.id_produktu }),
  });
};
</script>

<style scoped>
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
}
.btn-group {
  display: flex;
  gap: 0.5rem;
}
input {
  display: block;
  padding: 0.5rem;
  margin: 0.5rem 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
}
button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
