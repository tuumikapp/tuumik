<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <h1>View project</h1>
    <RouterLink to="/assets" class="btn">ASSETS</RouterLink>
    <RouterLink v-if="generalStore.user.permissions.projectsEdit" :to="{ name: 'projectEdit', params: { projectId } }" class="btn">EDIT THIS PROJECT</RouterLink>
    <RouterLink v-if="generalStore.user.permissions.clientsEdit" to="/clients/add" class="btn">NEW CLIENT</RouterLink>
    <RouterLink v-if="generalStore.user.permissions.projectsEdit" to="/projects/add" class="btn">NEW PROJECT</RouterLink>
    <ProjectViewDetails :project-id="projectId" />
    <ProjectViewTimes v-if="generalStore.user.permissions.composer" :project-id="projectId" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useGeneralStore } from '/src/client/stores/general.js';
import ProjectViewDetails from './components/ProjectViewDetails.vue';
import ProjectViewTimes from './components/ProjectViewTimes.vue';

const route = useRoute();
const generalStore = useGeneralStore();

const projectId = ref(null);
projectId.value = route.params.projectId;
</script>
