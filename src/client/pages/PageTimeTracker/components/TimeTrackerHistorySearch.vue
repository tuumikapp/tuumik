<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <div class="query-bar">
      <form @submit.prevent="performSearch($event)">
        <input placeholder="TASK DESCRIPTION" type="text" maxlength="100" name="taskDesc" class="query-desc" />
        <select v-if="generalStore.user.permissions.historyOthers" name="owner" class="sel">
          <option value="everyone" selected>EVERYONE</option>
          <option value="me">ME</option>
          <option value="others">OTHERS</option>
        </select>
        <select v-if="time.projectId" name="scope" class="sel">
          <option value="all" selected>ALL PROJECTS</option>
          <option value="clientProjects">THIS CLIENT</option>
          <option value="selectedProject">THIS PROJECT</option>
        </select>
        <select v-else-if="!time.projectId && time.clientId" name="scope" class="sel">
          <option value="all" selected>ALL PROJECTS</option>
          <option value="clientProjects">PROJECTS UNDER THIS CLIENT</option>
        </select>
        <select v-else-if="!time.projectId && !time.clientId" name="scope" class="sel">
          <option value="all" selected>ALL PROJECTS</option>
        </select>
        <select name="sort" class="sel">
          <option value="dte" selected>SORT: DATE</option>
          <option value="mod">SORT: MODIFIED</option>
        </select>
        <select name="limit" class="sel">
          <option value="10" selected>LIMIT: 10</option>
          <option value="40">LIMIT: 40</option>
        </select>
        <input type="submit" value="SEARCH" class="btn-submit" />
      </form>
      <div v-if="loadingList" class="spinner spinner-local"></div>
    </div>
    <div v-if="historyItems.length" class="history-holder">
      <div v-for="historyItem in historyItems" :key="historyItem._id" class="row-holder" @click="fillDataFromHistory(historyItem)">
        <div class="h-lastmod" :class="recentnessClass(historyItem)"></div>
        <span class="h-date">{{ displayDate(historyItem.date) }}</span>
        &bull;
        <span class="h-owner">{{ historyItem.ownerName }}</span>
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
import { ref } from 'vue';
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
  client: { type: Object, default: null },
});

const historyItems = ref([]);
const loadingList = ref(false);
const limit = ref(10);

async function performSearch(event) {
  loadingList.value = true;
  const taskDesc = event.target.taskDesc.value;
  const owner = event.target.owner.value ? event.target.owner.value : 'me';
  const scope = event.target.scope.value;
  const projectId = props.time?.projectId || undefined;
  const clientId = props.client?._id || undefined;
  const sort = event.target.sort.value;
  const limit2 = Number(event.target.limit.value);
  try {
    const res = await Meteor.callAsync('timeHistorySearch', taskDesc, owner, scope, projectId, clientId, sort, limit2);
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
.query-bar {
  padding: 0.8em 1.4em;
  background-color: #eeeeee;
  text-align: center;
  position: relative;
}

.query-desc,
.sel {
  margin: 0.4em 0.4em;
  height: 2.5em;
}

.query-desc {
  width: 20em;
}

.btn-submit {
  padding: 0 2em;
  margin: 0.4em 0.4em;
  height: 2.5em;
}

.spinner-local {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 2em;
  margin: auto;
  width: 2em;
  height: 2em;
}

.is-mobile .spinner-local {
  left: 0;
  right: 0;
  top: 1.4em;
  bottom: auto;
  margin: 0 auto;
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

.h-owner {
  color: #336600;
}

.h-taskdesc {
  color: #3333cc;
}

.h-duration {
  color: #ff0033;
}

.h-client {
  color: #1f1f1f;
}

.h-project {
  color: #1f1f1f;
}
</style>
