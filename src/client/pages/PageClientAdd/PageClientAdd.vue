<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <div v-if="loading" class="spinner spinner-global"></div>
    <h1>New Client</h1>
    <form class="main-pane" @submit.prevent="clientInsert1()">
      <label for="client-name" class="field-label">CLIENT NAME:</label>
      <input id="client-name" v-model="name" type="text" maxlength="500" />
      <input type="submit" value="CREATE CLIENT" class="btn-submit" />
    </form>
    <ClientAddHistory />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import ClientAddHistory from './components/ClientAddHistory.vue';

const router = useRouter();
const notifierStore = useNotifierStore();

const loading = ref(false);
const name = ref('');

function clientInsert1() {
  if (name.value) clientInsert2();
}

async function clientInsert2() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('clientInsert', name.value);
    notifierStore.addTemp({ type: 'success', txt: 'CLIENT CREATED' });
    router.push({ name: 'clientEdit', params: { clientId: res } });
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}
</script>
