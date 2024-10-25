<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="picker-holder">
    <div class="field-holder">
      <label class="field-label">CLIENT:</label>
      <AutoComplete v-if="!clientId" ac-type="clients" hint="CLIENTS" @autocomplete-pick="selectAcClient($event)" />
      <div v-else-if="client" class="client-picked">
        <div class="clear-client" @click="clearClient()"></div>
        {{ client.name }}
      </div>
      <div v-else>loading</div>
    </div>
    <div class="field-holder">
      <label class="field-label">PROJECT:</label>
      <AutoComplete v-if="!projectId && !clientId" ac-type="projects" hint="PROJECTS" @autocomplete-pick="selectAcProject($event)" />
      <select v-else-if="!projectId && clientId && selProjects" class="sel" @change="projectListSelect($event)">
        <option selected disabled>PROJECTS: {{ selProjects.length }}</option>
        <option v-for="selProject in selProjects" :key="selProject._id" :value="selProject._id">{{ selProject.name }}</option>
      </select>
      <div v-else-if="project" class="project-picked">
        <div class="clear-project" @click="clearProject()"></div>
        {{ project.name }}
      </div>
      <div v-else>loading</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import AutoComplete from '/src/client/components/AutoComplete/AutoComplete.vue';

const notifierStore = useNotifierStore();

const props = defineProps({
  clientId: { type: String, required: true },
  client: { type: Object, required: false },
  projectId: { type: String, required: true },
  project: { type: Object, required: false },
  selProjects: { type: Array, required: false },
});

const emit = defineEmits(['set-client-id', 'set-client', 'set-project-id', 'set-project', 'set-sel-projects']);

const loading = ref(false);

async function selectAcClient(result) {
  loading.value = true;
  emit('set-client-id', result._id);
  const clientId = result._id;
  try {
    const res = await Meteor.callAsync('pickClientInProjectPicker', clientId);
    emit('set-client', res.client);
    emit('set-sel-projects', res.projects);
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function selectAcProject(result) {
  loading.value = true;
  emit('set-project-id', result._id);
  const projectId = result._id;
  try {
    const res = await Meteor.callAsync('pickProjectInProjectPicker', projectId);
    emit('set-client', res.client);
    emit('set-client-id', res.client._id);
    emit('set-project', res.project);
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function clearClient() {
  emit('set-client-id', '');
  emit('set-client', '');
  emit('set-project-id', '');
  emit('set-project', '');
}

function clearProject() {
  emit('set-project-id', '');
  emit('set-project', '');
  selectAcClient({ _id: props.clientId });
}

async function projectListSelect(event) {
  loading.value = true;
  emit('set-project-id', event.target.value);
  const projectId = event.target.value;
  try {
    const res = await Meteor.callAsync('pickProjectInProjectPicker', projectId);
    emit('set-client', res.client);
    emit('set-project', res.project);
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}
</script>

<style scoped>
.field-holder {
  padding: 0.2em 0 0.2em 10em;
  margin: 0.2em 0;
  position: relative;
}

.is-mobile .field-holder {
  padding: 0.2em 0;
}

.field-label {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  height: 2em;
  line-height: 2em;
  width: 8.9em;
  margin: auto;
  padding: 0 0 0 1em;
  background-color: #eeeeee;
  color: #1f1f1f;
  border-radius: 0.3em 0 0 0.3em;
}

.is-mobile .field-label {
  display: none;
}

.sel,
.inp {
  width: 100%;
}

.client-picked {
  padding: 1em;
  background-color: #dfdfdf;
}

.is-mobile .client-picked {
  margin-right: 2.5em;
}

.clear-client {
  position: absolute;
  top: 0.2em;
  bottom: 0.2em;
  left: 7em;
  width: 2em;
  background-color: #ffa500;
  border-radius: 0.2em;
  background-image: url('/icons/close-light.svg');
  background-repeat: no-repeat;
  background-size: 70% auto;
  background-position: center center;
}

.is-mobile .clear-client {
  left: auto;
  right: 0;
  width: 2em;
}

.clear-client:hover {
  background-color: grey;
}

.project-picked {
  padding: 1em;
  background-color: #dfdfdf;
}

.is-mobile .project-picked {
  margin-right: 2.5em;
}

.clear-project {
  position: absolute;
  top: 0.2em;
  bottom: 0.2em;
  left: 7em;
  width: 2em;
  background-color: #ffa500;
  border-radius: 0.2em;
  background-image: url('/icons/close-light.svg');
  background-repeat: no-repeat;
  background-size: 70% auto;
  background-position: center center;
}

.is-mobile .clear-project {
  left: auto;
  right: 0;
  width: 2em;
}

.clear-project:hover {
  background-color: grey;
}
</style>
