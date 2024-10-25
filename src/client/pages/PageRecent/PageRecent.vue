<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <div class="sm-second-menu">
      <span :class="{ 'sm-btn-on': cutoff === '10days' }" class="sm-btn sm-tip-holder" @click="cutoff = '10days'; loadTimes();">10 days<span class="sm-tip">SHOW LAST 10 DAYS</span></span>
      <span :class="{ 'sm-btn-on': cutoff === '30days' }" class="sm-btn sm-tip-holder" @click="cutoff = '30days'; loadTimes();">30 days<span class="sm-tip">SHOW LAST 30 DAYS</span></span>
    </div>
    <h1>My Recent Tasks</h1>
    <table v-if="times.length && !generalStore.isMobile" class="timetable">
      <tr>
        <th class="tth">Date</th>
        <th class="tth">Time</th>
        <th class="tth">Duration</th>
        <th class="tth">Client</th>
        <th class="tth">Project</th>
        <th class="tth">Task</th>
      </tr>
      <tr v-for="time in times" :key="time._id" class="ttr">
        <td class="ttd tdate">{{ displayDate(time.date) }}</td>
        <td class="ttd ttime">
          {{ displayTimeFromMinutes(time.startMinute) }} -
          {{ displayTimeFromMinutes(time.endMinute) }}
        </td>
        <td class="ttd tduration">{{ displayDuration(time) }}</td>
        <td class="ttd tclient">{{ time.clientName }}</td>
        <td class="ttd tproject">{{ time.projectName }}</td>
        <td class="ttd ttask">
          <span v-if="time.useTaskType">{{ time.taskType }} </span>{{ time.taskDesc }}
          <div v-if="time.intCom" class="intcom">{{ time.intCom }}</div>
        </td>
      </tr>
    </table>

    <div v-else-if="times.length" class="times-holder">
      <div v-for="time in times" :key="time._id" class="row-holder">
        <span class="h-date">{{ displayDate(time.date) }}</span>
        &bull;
        <span class="h-time">
          {{ displayTimeFromMinutes(time.startMinute) }} -
          {{ displayTimeFromMinutes(time.endMinute) }}
        </span>
        &bull;
        <span class="h-duration">{{ displayDuration(time) }}</span>
        &bull;
        <span class="h-client">{{ time.clientName }}</span>
        &bull;
        <span class="h-project">{{ time.projectName }}</span>
        &bull;
        <span class="h-taskdesc">
          <span v-if="time.useTaskType">{{ time.taskType }}</span>
          <span>{{ time.taskDesc }}</span>
          <div v-if="time.intCom" class="intcom">{{ time.intCom }}</div>
        </span>
      </div>
    </div>

    <div v-if="!loading && !times.length" class="no-results">NO RESULTS</div>
    <div v-if="loading" class="spinner spinner-global"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { minutesToDuration } from '/src/shared/utils/time.js';

dayjs.extend(utc);

const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();

const loading = ref(false);
const cutoff = ref('10days');
const times = ref([]);

onMounted(() => {
  loadTimes();
});

async function loadTimes() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('loadRecentTimes', cutoff.value);
    times.value = res.times;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function displayDuration(time) {
  const x = time.endMinute - time.startMinute;
  return minutesToDuration(x);
}

function displayTimeFromMinutes(minutes) {
  const format = generalStore.tenant.timeFormat;
  return dayjs().hour(0).minute(minutes).format(format);
}

function displayDate(date, notUtc, customFormat) {
  const format = customFormat || generalStore.tenant.dateFormat;
  return !notUtc ? dayjs.utc(date).format(format) : dayjs(date).format(format);
}
</script>

<style scoped>
.timetable {
  width: 100%;
  border-collapse: collapse;
  color: #1f1f1f;
  border-radius: 0.2em;
  margin: 0 0 3em 0;
}

.tth {
  border: 1px solid #cecece;
  padding: 1.4em 0.9em;
  text-align: left;
  font-weight: 600;
}

.ttd {
  border: 1px solid #cecece;
  padding: 0.4em 0.9em;
  vertical-align: top;
}

.tdate {
  width: 6em;
}

.ttime {
  width: 9em;
}

.tduration {
  width: 5em;
}

.tsum {
  width: 12em;
}

.tclient {
  width: 20%;
}

.tproject {
  width: 30%;
}

.ttask {
  color: #000000;
}

.times-holder {
  margin: 0 0 3em 0;
}

.row-holder {
  margin: 1em 0;
  padding: 0.2em 0;
  color: #1f1f1f;
  position: relative;
}

.h-date {
  color: grey;
}

.h-time {
  color: grey;
}

.h-taskdesc {
  color: #000000;
}

.h-duration {
  color: #135797;
}

.h-client {
  color: grey;
}

.h-project {
  color: grey;
}

.intcom {
  color: #c93f1c;
}

.no-results {
  margin: 0 0 3em 0;
}
</style>
