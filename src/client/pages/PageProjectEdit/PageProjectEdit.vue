<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <div v-if="loading" class="spinner spinner-global"></div>
    <h1 v-if="!project"></h1>
    <div v-else>
      <h1>{{ project.name }}</h1>
      <div class="subtext">{{ project.clientName }}</div>
      <form class="main-pane" @submit.prevent="projectSave()">
        <div class="section-title">GENERAL</div>
        <label for="project-name" class="field-label">PROJECT NAME:</label>
        <input id="project-name" v-model="project.name" placeholder="PROJECT NAME" type="text" maxlength="500" />
        <label class="field-label">CLIENT:</label>
        <AutoComplete ac-type="clients" clear-after @autocomplete-pick="selectAcClient($event)" />
        <div :class="{ 'single-drop-filled': project.clientName }" class="single-drop">
          <span v-if="project.clientName">{{ project.clientName }}</span>
        </div>
        <div class="section-title">TRACKER</div>
        <label v-if="taskGroups.length" class="field-label">TASK GROUPS:</label>
        <div v-if="taskGroups.length" class="chk-holder-hori">
          <label v-for="taskGroup in taskGroups" :key="taskGroup._id" class="chk-label">
            <input v-model="project.taskGroupIds" type="checkbox" :value="taskGroup._id" />
            <span>{{ taskGroup.name }}</span>
          </label>
        </div>
        <label class="field-label">TASK TYPES:</label>
        <label class="single-checkbox-label">
          <input v-model="project.useTaskTypes" type="checkbox" />
          <span>ENABLED</span>
        </label>
        <label for="project-reminder" class="field-label">REMINDER:</label>
        <input id="project-reminder" v-model="project.reminder" placeholder="REMINDER" type="text" maxlength="500" />
        <input type="submit" value="SAVE CHANGES" class="btn-submit" />
        <div class="section-title deletion-sec">DELETION</div>
        <span class="btn" @click="projectDelete()">
          DELETE PROJECT
        </span>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import AutoComplete from '/src/client/components/AutoComplete/AutoComplete.vue';

const router = useRouter();
const route = useRoute();
const notifierStore = useNotifierStore();

const loading = ref(false);
const taskGroups = ref([]);
const project = ref(null);

onMounted(() => {
  projectLoad();
});

async function projectLoad() {
  loading.value = true;
  const projectId = route.params.projectId;
  try {
    const res = await Meteor.callAsync('getProjectForEdit', projectId);
    project.value = res.project;
    taskGroups.value = res.taskGroups;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function projectSave() {
  loading.value = true;
  try {
    await Meteor.callAsync('projectSave', project.value);
    notifierStore.addTemp({ type: 'success', txt: 'PROJECT SAVED' });
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function projectDelete() {
  loading.value = true;
  const projectId = project.value._id;
  try {
    await Meteor.callAsync('projectDelete', projectId);
    notifierStore.addTemp({ type: 'success', txt: 'PROJECT DELETED' });
    router.push('/assets');
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}
</script>

<style scoped>
.subtext {
  margin: -0.9em 0 0.9em 0;
}

.deletion-sec {
  margin: 9em 0 1em 0;
}
</style>
