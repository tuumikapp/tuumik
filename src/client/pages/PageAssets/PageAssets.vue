<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <h1>Search Clients & Projects</h1>
    <div class="group-holder">
      <AutoComplete ac-type="clients" hint="CLIENTS" class="ac-holder" @autocomplete-pick="selectAcClient($event)" />
      <AutoComplete ac-type="projects" hint="PROJECTS" class="ac-holder" @autocomplete-pick="selectAcProject($event)" />
      <RouterLink v-if="generalStore.user.permissions.catalog" to="/catalog" class="btn">CATALOG</RouterLink>
      <RouterLink v-if="generalStore.user.permissions.clientsEdit" to="/clients/add" class="btn">NEW CLIENT</RouterLink>
      <RouterLink v-if="generalStore.user.permissions.projectsEdit" to="/projects/add" class="btn">NEW PROJECT</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useGeneralStore } from '/src/client/stores/general.js';
import AutoComplete from '/src/client/components/AutoComplete/AutoComplete.vue';

const router = useRouter();
const generalStore = useGeneralStore();

function selectAcClient(result) {
  router.push({ name: 'clientView', params: { clientId: result._id } });
}

function selectAcProject(result) {
  router.push({ name: 'projectView', params: { projectId: result._id } });
}
</script>

<style scoped>
.group-holder {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin: 2em 0;
}

.ac-holder {
  width: 20em;
  margin: 0 1em 0 0;
}

.is-mobile .ac-holder {
  width: 100%;
  margin: 0 0 2em 0;
}

.btn {
  display: block;
  width: 10em;
  text-align: center;
  margin: 0 1em 0 0;
}

.is-mobile .btn {
  width: 100%;
  margin: 0 0 2em 0;
}
</style>
