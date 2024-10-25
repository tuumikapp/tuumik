<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <ul class="tabmenu-ul">
      <li :class="{ 'tab-active': tab === 'history' }" class="tabmenu-li" @click="tab = 'history'">HISTORY</li>
      <li :class="{ 'tab-active': tab === 'search' }" class="tabmenu-li" @click="tab = 'search'">SEARCH</li>
      <li :class="{ 'tab-active': tab === 'internal' }" class="tabmenu-li" @click="tab = 'internal'">INTERNAL</li>
    </ul>
    <div v-if="tab === 'history'" :class="{ 'history-double': generalStore.user.permissions.historyOthers && (time.projectId || time.clientId) }" class="history-holder">
      <div :class="{ 'history-self': generalStore.user.permissions.historyOthers && (time.projectId || time.clientId) }">
        <TimeTrackerHistoryClearSelf v-if="!time.projectId && !time.clientId" :time="time" />
        <TimeTrackerHistoryProjectSelf v-else-if="time.projectId" :time="time" :project="project" />
        <TimeTrackerHistoryClientSelf v-else-if="!time.projectId && client" :time="time" :client="client" />
      </div>
      <div v-if="generalStore.user.permissions.historyOthers" class="history-others">
        <TimeTrackerHistoryProjectOthers v-if="time.projectId" :time="time" :project="project" />
        <TimeTrackerHistoryClientOthers v-else-if="!time.projectId && client" :time="time" :client="client" />
      </div>
    </div>
    <TimeTrackerHistorySearch v-else-if="tab === 'search'" :time="time" :client="client" class="search-holder" />
    <TimeTrackerTabInternal v-else-if="tab === 'internal'" :time="time" class="internal-holder" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import TimeTrackerHistoryClearSelf from './TimeTrackerHistoryClearSelf.vue';
import TimeTrackerHistoryProjectSelf from './TimeTrackerHistoryProjectSelf.vue';
import TimeTrackerHistoryProjectOthers from './TimeTrackerHistoryProjectOthers.vue';
import TimeTrackerHistoryClientSelf from './TimeTrackerHistoryClientSelf.vue';
import TimeTrackerHistoryClientOthers from './TimeTrackerHistoryClientOthers.vue';
import TimeTrackerHistorySearch from './TimeTrackerHistorySearch.vue';
import TimeTrackerTabInternal from './TimeTrackerTabInternal.vue';

const generalStore = useGeneralStore();

const props = defineProps({
  time: { type: Object, required: true },
  taskGroups: { type: Array, required: true },
  client: { type: Object, default: null },
  project: { type: Object, default: null },
});

const tab = ref('history');
</script>

<style scoped>
.tabmenu-ul {
  list-style-type: none;
  margin: 1em 0 0 0;
  padding: 0;
  height: 2.5em;
  display: flex;
  align-items: flex-end;
}

.tabmenu-li {
  margin: 0 0.2em 0 0;
  padding: 0.4em 0.8em;
  border-radius: 0.4em 0.4em 0 0;
  background-color: #d4d4d4;
  color: #6d6d6d;
  display: inline-block;
  transition: padding 50ms ease-out, color 250ms ease-out;
}

.tabmenu-li:hover {
  padding-bottom: 1em;
}

.tab-active {
  color: #000000;
  background-color: #eeeeee;
}

.history-holder,
.search-holder,
.internal-holder {
  background-color: #eeeeee;
  min-height: 22em;
}

.history-double {
  display: flex;
  justify-content: space-between;
}

.history-double {
  display: flex;
  justify-content: space-between;
}

.is-mobile .history-double {
  display: block;
}

.history-self {
  width: 49%;
}

.is-mobile .history-self {
  width: auto;
}

.history-others {
  width: 49%;
  margin: 0 0 0 1em;
  padding: 0 0 0 1em;
  border-left: 1px solid #d6d6d6;
}

.is-mobile .history-others {
  width: auto;
  margin: 2em 0 0 0;
  padding: 0;
}
</style>
