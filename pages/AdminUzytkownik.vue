<template>
  <div class="space-y-6">
    <h2 class="section-title">Zarządzaj użytkownikami</h2>
    <div class="btn-group">
      <button @click="action = 'edit'">Edytuj</button>
      <button @click="action = 'delete'">Usuń</button>
    </div>

    <form v-if="action === 'edit'" @submit.prevent="editUser">
      <input v-model.number="form.id" placeholder="ID użytkownika" required />
      <input v-model="form.name" placeholder="Nowa nazwa" />
      <input v-model="form.email" placeholder="Nowy email" />
      <div class="checkbox-row">
      <p>CZY JEST ADMINEM?</p><input v-model="form.stanowisko" placeholder="Admin?" type="checkbox"/>
      </div>
      <button type="submit">Zapisz zmiany</button>
    </form>

    <form v-if="action === 'delete'" @submit.prevent="deleteUser">
      <input v-model.number="form.id" placeholder="ID użytkownika" required />
      <button type="submit">Usuń użytkownika</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import APIFetch from '~/composables/fetchAPI';

const action = ref('');
const form = ref({ id: null, name: '', email: '', stanowisko:false});

const editUser = async () => {
  await APIFetch('/admin/user', {
    method: 'PATCH',
    body: JSON.stringify(form.value),
  });
};

const deleteUser = async () => {
  await APIFetch('/admin/user', {
    method: 'DELETE',
    body: JSON.stringify({ id: form.value.id }),
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
.checkbox-row {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* space between text and checkbox */
}

.checkbox-row p {
  margin: 0; /* remove default margin */
  user-select: none;
}
</style>