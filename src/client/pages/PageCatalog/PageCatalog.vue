<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <div class="sm-second-menu">
      <RouterLink v-if="!generalStore.isMobile" to="/clients/add" class="sm-btn sm-btn-on">NEW CLIENT</RouterLink>
      <div v-if="!generalStore.isMobile" class="sm-divider"></div>
      <RouterLink v-if="!generalStore.isMobile" to="/projects/add" class="sm-btn sm-btn-on">NEW PROJECT</RouterLink>
      <div v-if="!generalStore.isMobile" class="sm-divider"></div>
      <RouterLink to="/assets" class="sm-btn">SEARCH & EDIT</RouterLink>
      <div class="sm-divider"></div>
      <span class="sm-btn" @click="loadClients()">REFRESH</span>
      <div class="sm-items-right"></div>
    </div>
    <h1>Clients & Projects</h1>
    <CatalogClient v-for="client in clients" :key="client._id" :client="client" />
    <div v-if="loading" class="spinner spinner-global"></div>
    <div v-else-if="!clients.length" class="no-results">NO CLIENTS</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import CatalogClient from './components/CatalogClient.vue';

const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();

const loading = ref(false);
const clients = ref([]);

onMounted(() => {
  loadClients();
});

async function loadClients() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('catalogClients');
    clients.value = res;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}
</script>

<style scoped>
.no-results {
  padding: 1em;
  text-align: center;
  border-top: 1px solid #c9c9c9;
}
</style>
