<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <div v-if="loading" class="spinner spinner-global"></div>
    <h1>New Project</h1>
    <form class="main-pane" @submit.prevent="projectInsert1()">
      <label for="project-name" class="field-label">PROJECT NAME:</label>
      <input id="project-name" v-model="name" type="text" maxlength="500" />
      <label class="field-label">CLIENT:</label>
      <AutoComplete ac-type="clients" clear-after @autocomplete-pick="selectAcClient($event)" />
      <div :class="{ 'single-drop-filled': client }" class="single-drop">
        <span v-if="client">{{ client.name }}</span>
      </div>
      <input type="submit" value="CREATE PROJECT" class="btn-submit" />
    </form>
    <ProjectAddHistory />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import AutoComplete from '/src/client/components/AutoComplete/AutoComplete.vue';
import ProjectAddHistory from './components/ProjectAddHistory.vue';

const router = useRouter();
const notifierStore = useNotifierStore();

const loading = ref(false);
const client = ref(null);
const name = ref('');

function projectInsert1() {
  if (name.value && client.value) projectInsert2();
}

async function projectInsert2() {
  loading.value = true;
  const clientId = client.value._id;
  try {
    const res = await Meteor.callAsync('projectInsert', name.value, clientId);
    notifierStore.addTemp({ type: 'success', txt: 'PROJECT CREATED' });
    router.push({ name: 'projectEdit', params: { projectId: res } });
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function selectAcClient(result) {
  client.value = result;
}
</script>
