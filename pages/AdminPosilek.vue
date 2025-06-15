<template>
  <div class="space-y-6">
    <h2 class="section-title">Zarządzaj posiłkami</h2>
    <div class="btn-group">
      <button @click="action = 'add'">Dodaj</button>
      <button @click="action = 'edit'">Edytuj</button>
      <button @click="action = 'delete'">Usuń</button>
    </div>

    <form v-if="action === 'add'" @submit.prevent="addMeal">
      <input v-model="form.nazwa" placeholder="Nazwa posiłku" required />
      <button type="submit">Dodaj</button>
    </form>

    <form v-if="action === 'edit'" @submit.prevent="editMeal">
      <input v-model.number="form.id_posilku" placeholder="ID" required />
      <input v-model="form.nazwa" placeholder="Nowa nazwa" />
      <button type="submit">Zapisz</button>
    </form>

    <form v-if="action === 'delete'" @submit.prevent="deleteMeal">
      <input v-model.number="form.id_posilku" placeholder="ID" required />
      <button type="submit">Usuń</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import APIFetch from '~/composables/fetchAPI';

const action = ref('');
const form = ref({ id_posilku: null, nazwa: '' });

const addMeal = async () => {
  await APIFetch('/admin/meal', {
    method: 'POST',
    body: JSON.stringify(form.value),
  });
};

const editMeal = async () => {
  await APIFetch('/admin/meal', {
    method: 'PATCH',
    body: JSON.stringify(form.value),
  });
};

const deleteMeal = async () => {
  await APIFetch('/admin/meal', {
    method: 'DELETE',
    body: JSON.stringify({ id: form.value.id_posilku }),
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