<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <span class="title">Latest Tasks</span>
    <div v-if="times.length" class="history-holder">
      <div v-for="time in times" :key="time._id" class="row-holder">
        <div class="h-lastmod" :class="recentnessClass(time)"></div>
        <span class="h-date">{{ displayDate(time.date) }}</span>
        &bull;
        <span class="h-duration">{{ displayDuration(time) }}</span>
        &bull;
        <span class="h-owner">{{ time.ownerName }}</span>
        &bull;
        <span class="h-taskdesc">
          <span v-if="time.useTaskType">{{ time.taskType }}</span>
          <span>{{ time.taskDesc }}</span>
        </span>
      </div>
    </div>

    <div v-else-if="!loading" class="no-results">NO RESULTS</div>
    <div v-if="loading" class="spinner spinner-local"></div>
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
  projectId: { type: String, required: true },
});

const loading = ref(false);
const times = ref([]);

onMounted(() => {
  loadTimes();
});

async function loadTimes() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('getTimesForProjectView', props.projectId);
    times.value = res;
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

.no-results {
  padding: 1em;
  text-align: center;
  border-top: 1px solid #cecece;
}

.history-holder {
  margin: 0;
}

.row-holder {
  margin: 0;
  padding: 0.2em 0.2em 0.2em 0.9em;
  background-color: #ffffff;
  position: relative;
  border-bottom: 1px solid #cecece;
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
</style>
