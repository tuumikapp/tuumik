<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <div class="top-bar">
      <span>CLEAR/SELF</span>
      <span>
        <span :class="{ 'limit-active': limit === '10' }" class="limit-btn" @click="refreshList(10)">10</span>
        <span :class="{ 'limit-active': limit === '40' }" class="limit-btn" @click="refreshList(40)">40</span>
      </span>
      <div v-if="loadingList" class="spinner spinner-local"></div>
    </div>
    <div v-if="historyItems.length" class="history-holder">
      <div v-for="historyItem in historyItems" :key="historyItem._id" class="row-holder" @click="fillDataFromHistory(historyItem)">
        <div class="h-lastmod" :class="recentnessClass(historyItem)"></div>
        <span class="h-date">{{ displayDate(historyItem.date) }}</span>
        &bull;
        <span class="h-taskdesc">
          <span v-if="historyItem.useTaskType">{{ historyItem.taskType }}</span>
          <span>{{ historyItem.taskDesc }}</span>
        </span>
        &bull;
        <span class="h-client">{{ historyItem.clientName }}</span>
        &bull;
        <span class="h-project">{{ historyItem.projectName }}</span>
        &bull;
        <span class="h-duration">{{ displayDuration(historyItem) }}</span>
      </div>
    </div>

    <div v-else-if="!loadingList" class="no-results">NO RESULTS</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import { minutesToDuration } from '/src/shared/utils/time.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();

const props = defineProps({
  time: { type: Object, required: true },
});

const historyItems = ref([]);
const loadingList = ref(false);
const limit = ref(10);

onMounted(() => {
  refreshList(10);
});

async function refreshList(limit2) {
  limit.value = limit2;
  loadingList.value = true;
  const timeId = props.time._id;
  try {
    const res = await Meteor.callAsync('timeHistoryClearSelf', timeId, limit2);
    historyItems.value = res;
    loadingList.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loadingList.value = false;
  }
}

function displayDate(date, notUtc, customFormat) {
  const format = customFormat || generalStore.tenant.dateFormat;
  return !notUtc ? dayjs.utc(date).format(format) : dayjs(date).format(format);
}

function displayDuration(historyItem) {
  const x = historyItem.endMinute - historyItem.startMinute;
  return minutesToDuration(x);
}

function recentnessClass(historyItem) {
  const modDate = dayjs.utc(historyItem.lastModified);
  const nowDate = dayjs.utc();
  const diff = nowDate.diff(modDate, 'minutes');
  if (diff < 10) return 'recentness1';
  if (diff < 120) return 'recentness2';
  if (diff < 1440) return 'recentness3';
  if (diff < 10080) return 'recentness4';
  return 'recentness5';
}

async function fillDataFromHistory(historyItem) {
  const timeId = props.time._id;
  const projectId = historyItem.projectId;
  const taskType = historyItem.taskType ? historyItem.taskType : '';
  const taskDesc = historyItem.taskDesc ? historyItem.taskDesc : '';
  const useTaskType = !!historyItem.useTaskType;
  try {
    await Meteor.callAsync('timeFillData', timeId, projectId, taskType, taskDesc, useTaskType);
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
  }
}
</script>

<style scoped>
.top-bar {
  padding: 0.8em 1.4em;
  background-color: #eeeeee;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.limit-btn {
  display: inline-block;
  padding: 0.4em 0.8em;
  border: 1px solid #d6d6d6;
  border-radius: 0.2em;
  color: #6d6d6d;
}

.limit-btn:hover {
  border: 1px solid #5e5e5e;
}

.limit-active {
  background-color: #444444;
  border: 1px solid #444444;
  color: #eeeeee;
}

.spinner-local {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: 2em;
  height: 2em;
}

.no-results {
  padding: 1em;
  text-align: center;
  border-top: 1px solid #d6d6d6;
  color: #eeeeee;
}

.history-holder {
  margin: 0;
}

.row-holder {
  margin: 0;
  padding: 0.2em 0.2em 0.2em 0.9em;
  background-color: #eeeeee;
  color: #1f1f1f;
  position: relative;
  border-bottom: 1px solid #d6d6d6;
}

.row-holder:hover {
  background-color: #f7f7f7;
}

.h-lastmod {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 0.4em;
}

.h-date {
  color: #1f1f1f;
}

.h-taskdesc {
  color: #3333cc;
}

.h-duration {
  color: #ff0033;
}
</style>
