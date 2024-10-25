<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="client-holder" @click.self="toggleClientOpen()">
    {{ client.name }}
    <RouterLink v-if="open" :to="'/clients/view/' + client._id" class="btn">OPEN</RouterLink>
    <div v-if="open" class="client-expander">
      <div v-for="project in projects" :key="project._id" class="project-row">
        <span class="project-year">{{ projectYear(project) }}</span>
        {{ project.name }}
        <RouterLink :to="'/projects/view/' + project._id" class="btn">OPEN</RouterLink>
      </div>
      <div v-if="loading" class="spinner spinner-local"></div>
      <div v-else-if="!projects.length" class="no-results">NO PROJECTS</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import dayjs from 'dayjs';

const notifierStore = useNotifierStore();

const props = defineProps({
  client: { type: Object, required: true },
});

const loading = ref(false);
const projects = ref([]);
const open = ref(false);

function toggleClientOpen() {
  if (open.value) {
    open.value = false;
  } else {
    open.value = true;
    loadProjects();
  }
}

async function loadProjects() {
  loading.value = true;
  const clientId = props.client._id;
  try {
    const res = await Meteor.callAsync('catalogProjectsForClient', clientId);
    projects.value = res;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function projectYear(project) {
  return dayjs(project.created).format('YYYY');
}
</script>

<style scoped>
.client-holder {
  padding: 0.6em 1em;
  margin: 0.6em 0;
  user-select: none;
  background-color: #ffffff;
}

.is-mobile .client-holder {
  padding: 1em 1em;
}

.client-expander {
  padding: 0.4em 1em;
  margin: 1em -1em -0.6em -1em;
  background-color: #f9f9f9;
  border-top: 1px solid #c9c9c9;
}

.is-mobile .client-expander {
  margin: 1em -1em -1em -1em;
}

.project-row {
  padding: 0.4em 0;
  font-weight: 600;
}

.project-year {
  color: #5469d4;
}

.btn {
  margin-left: 0.8em;
  padding-top: 0.2em;
  padding-bottom: 0.2em;
}

.spinner-local {
  width: 2em;
  height: 2em;
  margin: 0;
}
</style>
