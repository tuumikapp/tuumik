<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <div v-if="loading" class="spinner spinner-global"></div>
    <h1>Task groups</h1>
    <table class="groups-table">
      <tr>
        <th class="gth">Name</th>
        <th class="gth">Position</th>
        <th class="gth">Default</th>
        <th class="gth"></th>
        <th class="gth"></th>
      </tr>
      <tr v-for="taskGroup in taskGroups" :key="taskGroup._id">
        <td class="gtd gname">
          {{ taskGroup.name }}
        </td>
        <td class="gtd gposition">
          {{ taskGroup.position }}
        </td>
        <td class="gtd gdefault">
          <span v-if="taskGroup.showByDefault">YES</span>
          <span v-else>NO</span>
        </td>
        <td class="gtd gedit">
          <RouterLink :to="'/admin/taskgroups/edit/' + taskGroup._id" class="btn">EDIT</RouterLink>
        </td>
        <td class="gtd gdelete">
          <span class="btn" @click="deleteTaskGroup(taskGroup)">DELETE</span>
        </td>
      </tr>
      <tr v-if="!loading && !taskGroups.length">
        <td class="gtd" colspan="5">NO TASK GROUPS CREATED</td>
      </tr>
    </table>

    <form class="add-form" @submit.prevent="insertTaskGroup1()">
      <input id="name-new" v-model="nameNew" type="text" maxlength="40" placeholder="NAME" />
      <input type="submit" value="ADD TASK GROUP" class="btn-submit" />
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';

const notifierStore = useNotifierStore();

const loading = ref(false);
const taskGroups = ref([]);
const nameNew = ref('');

onMounted(() => {
  loadTaskGroups();
});

async function loadTaskGroups() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('loadTaskGroups');
    taskGroups.value = res;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function insertTaskGroup1() {
  if (!nameNew.value) {
    notifierStore.addTemp({ type: 'error', txt: 'PLEASE FILL NAME FIELD' });
  } else {
    insertTaskGroup2();
  }
}

async function insertTaskGroup2() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('insertTaskGroup', nameNew.value);
    taskGroups.value = res;
    nameNew.value = '';
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function deleteTaskGroup(taskGroup) {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('deleteTaskGroup', taskGroup._id);
    taskGroups.value = res;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}
</script>

<style scoped>
.groups-table {
  width: 50em;
  border-collapse: collapse;
}

.gth {
  border: 1px solid #cecece;
  padding: 0.9em 0.4em;
  text-align: left;
}

.gtd {
  border: 1px solid #cecece;
  padding: 0.2em 0.4em;
  vertical-align: middle;
}

.gname {
  width: auto;
}

.gposition {
  width: 14%;
}

.gdefault {
  width: 14%;
}

.gedit {
  width: 6em;
  text-align: center;
}

.gdelete {
  width: 6em;
  text-align: center;
}

.add-form {
  margin: 3em 0 0 0;
}

.btn-submit {
  margin-top: 0;
}

#name-new {
  width: 24em;
}
</style>
