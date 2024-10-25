<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <ul v-if="selectedTaskGroups.length" class="task-groups-ul">
      <li v-for="selectedTaskGroup in selectedTaskGroups" :key="selectedTaskGroup._id" class="task-groups-li">
        {{ selectedTaskGroup.name }}
      </li>
    </ul>
    <div v-if="client && client.reminder" class="reminder-client">
      <div class="reminder-title">CLIENT REMINDER</div>
      {{ client.reminder }}
    </div>
    <div v-if="project && project.reminder" class="reminder-project">
      <div class="reminder-title">PROJECT REMINDER</div>
      {{ project.reminder }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  time: { type: Object, required: true },
  taskGroups: { type: Array, required: true },
  client: { type: Object, default: null },
  project: { type: Object, default: null },
});

const selectedTaskGroups = computed(() => {
  const groupsOut = [];
  if (!props.project?.taskGroupIds) return groupsOut;
  for (let i = 0; i < props.taskGroups.length; i += 1) {
    if (props.project.taskGroupIds.includes(props.taskGroups[i]._id)) groupsOut.push(props.taskGroups[i]);
  }
  return groupsOut;
});
</script>

<style scoped>
.task-groups-ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
  text-align: right;
}

.task-groups-li {
  display: inline-block;
  margin: 0.1em 0 0.1em 0.5em;
  padding: 0.2em 0.5em;
  background-color: #dfdfdf;
  color: #5c5c5c;
  border-radius: 0.2em;
  text-transform: uppercase;
}

.reminder-client {
  padding: 0.4em 1em 0.8em 1em;
  margin: 0.4em 0;
  background-color: #fdc968;
  border-radius: 0.2em;
}

.reminder-project {
  padding: 0.4em 1em 0.8em 1em;
  margin: 0.4em 0;
  background-color: #6cfd6c;
  border-radius: 0.2em;
}

.reminder-title {
  font-size: 0.8em;
  margin: 0 0 0.4em 0;
}
</style>
