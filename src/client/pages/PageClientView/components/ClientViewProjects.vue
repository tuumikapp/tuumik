<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <span class="title">Projects</span>
    <table v-if="projects.length" class="project-table">
      <tr v-for="project in projects" :key="project._id" class="htr">
        <td class="htd htd-created">
          {{ displayDate(project.created, false, 'YYYY') }}
        </td>
        <td class="htd htd-name">
          <RouterLink :to="'/projects/view/' + project._id" class="rlink">
            {{ project.name }}
          </RouterLink>
        </td>
      </tr>
    </table>

    <div v-else-if="!loading" class="no-results">NO RESULTS</div>
    <div v-if="loading" class="spinner spinner-local"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();

const props = defineProps({
  clientId: { type: String, required: true },
});

const loading = ref(false);
const projects = ref([]);

onMounted(() => {
  loadProjects();
});

async function loadProjects() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('getProjectsForClientView', props.clientId);
    projects.value = res.projects;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function displayDate(date, notUtc, customFormat) {
  const format = customFormat || generalStore.tenant.dateFormat;
  return !notUtc ? dayjs.utc(date).format(format) : dayjs(date).format(format);
}
</script>

<style scoped>
.title {
  background-color: #ffffff;
  padding: 0.4em 0.9em;
  display: inline-block;
  margin: 2em 0 0 0;
  border-radius: 0.2em 0.2em 0 0;
}

.spinner-local {
  width: 2em;
  height: 2em;
  margin: 1em;
}

.project-table {
  width: 100%;
  margin: 0;
  padding: 0;
  border-collapse: collapse;
}

.htr {
  margin: 0;
  padding: 0.2em 0.2em 0.2em 1.4em;
}

.htd {
  background-color: #ffffff;
  border: 1px solid #cecece;
  padding: 0.2em 0.4em;
  vertical-align: top;
}

.htd-created {
  width: 2.9em;
}

.htd-name {
  color: #1f1f1f;
}
</style>
