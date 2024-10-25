<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <h1>View client</h1>
    <RouterLink to="/assets" class="btn">ASSETS</RouterLink>
    <RouterLink v-if="generalStore.user.permissions.clientsEdit" :to="{ name: 'clientEdit', params: { clientId } }" class="btn">EDIT THIS CLIENT</RouterLink>
    <RouterLink v-if="generalStore.user.permissions.clientsEdit" to="/clients/add" class="btn">NEW CLIENT</RouterLink>
    <RouterLink v-if="generalStore.user.permissions.projectsEdit" to="/projects/add" class="btn">NEW PROJECT</RouterLink>
    <ClientViewDetails :client-id="clientId" />
    <ClientViewProjects :client-id="clientId" />
    <ClientViewTimes v-if="generalStore.user.permissions.composer" :client-id="clientId" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useGeneralStore } from '/src/client/stores/general.js';
import ClientViewDetails from './components/ClientViewDetails.vue';
import ClientViewProjects from './components/ClientViewProjects.vue';
import ClientViewTimes from './components/ClientViewTimes.vue';

const route = useRoute();
const generalStore = useGeneralStore();

const clientId = ref(null);
clientId.value = route.params.clientId;
</script>
