<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div id="time-tracker-base">
    <TimeTrackerMenu :tracker-date="trackerDate" :times="times" />
    <TimeTrackerRow v-for="time in times" :key="time._id" :time="time" :task-groups="taskGroups" :open-id="openId" @set-open-id="openId = $event" />
    <div v-if="!times.length" class="empty-holder">
      <div class="weekday">{{ displayDate(trackerDate, true, 'dddd') }}</div>
      <div class="date">{{ displayDate(trackerDate) }}</div>
    </div>
    <div v-if="!inserting && !openId" class="circle-btn" @click="timeInsertCircle()">
      <span class="c-tip c-tip-rev">INSERT TIME</span>
    </div>
    <div v-else-if="!openId" class="circle-btn circle-btn-inserting"></div>
    <div v-if="!openId" class="circle-btn circle-btn-mode" @click="trackerStore.viewMode = 'visual'">
      <span class="c-tip">CALENDAR VIEW</span>
    </div>
    <div v-if="!openId" class="circle-btn circle-btn-prev" @click="datePrev()">
      <span class="c-tip">PREVIOUS DATE</span>
    </div>
    <div v-if="!openId" class="circle-btn circle-btn-next" @click="dateNext()">
      <span class="c-tip">NEXT DATE</span>
    </div>
    <div v-if="loading" class="spinner spinner-global"></div>
    <div v-if="inserting" class="spinner spinner-global"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { useTrackerStore } from '/src/client/stores/tracker.js';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import TimeTrackerMenu from './TimeTrackerMenu.vue';
import TimeTrackerRow from './TimeTrackerRow.vue';
import { Times } from '/src/shared/collections/collections.js';

dayjs.extend(utc);

const router = useRouter();
const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();
const trackerStore = useTrackerStore();

const props = defineProps({
  trackerDate: { type: Number, required: true },
});

const loading = ref(false);
const inserting = ref(false);
const times = ref([]);
const taskGroups = ref([]);
const openId = ref('');

onMounted(() => {
  loadTaskGroups();
});

async function loadTaskGroups() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('getTaskGroups');
    taskGroups.value = res;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function timeInsertCircle() {
  inserting.value = true;
  const selDate = dayjs.utc(props.trackerDate).hour(0).minute(0).second(0).millisecond(1).toDate();

  const now = new Date();
  const startMinute = now.getHours() * 60 + now.getMinutes();
  try {
    const res = await Meteor.callAsync('timeInsert', selDate, startMinute);
    openId.value = res.timeId;
    inserting.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    inserting.value = false;
  }
}

function displayDate(date, notUtc, customFormat) {
  const format = customFormat || generalStore.tenant.dateFormat;
  return !notUtc ? dayjs.utc(date).format(format) : dayjs(date).format(format);
}

function datePrev() {
  const trackerDate = dayjs(props.trackerDate).subtract(1, 'days').format('YYYY-MM-DD');
  router.push({ name: 'timeTracker', params: { trackerDate } });
}

function dateNext() {
  const trackerDate = dayjs(props.trackerDate).add(1, 'days').format('YYYY-MM-DD');
  router.push({ name: 'timeTracker', params: { trackerDate } });
}

// LIVE QUERY TIMES
let trackerQueryTimes = undefined;

watch(() => props.trackerDate, (to, from) => {
  if (trackerQueryTimes) trackerQueryTimes.stop();
  makeQuery1();
}, { immediate: true });

function makeQuery1() {
  trackerQueryTimes = Tracker.autorun(() => {
    const selDate = dayjs.utc(props.trackerDate).hour(0).minute(0).second(0).millisecond(1).toDate();
    times.value = Times.find({ date: selDate, owner: Meteor.userId() }, { sort: { startMinute: 1 } }).fetch();
  });
}
// /LIVE QUERY TIMES

// METEOR CLEANUP
onUnmounted(() => {
  if (trackerQueryTimes) trackerQueryTimes.stop();
});
// /METEOR CLEANUP
</script>

<style scoped>
#time-tracker-base {
  padding: 1em 1em 9em 1em;
}

.circle-btn {
  position: fixed;
  bottom: 1em;
  right: 1em;
  width: 5em;
  height: 5em;
  background-color: #ffffff;
  border: 1px solid #cecece;
  border-radius: 50%;
  z-index: 2000;
  box-shadow: 0.1em 0.1em 0.2em 0.2em rgba(0, 0, 0, 0.03);
  background-image: url('/icons/plus-green.svg');
  background-repeat: no-repeat;
  background-size: 70% auto;
  background-position: center center;
  transition: all 100ms ease-out;
  user-select: none;
}

.circle-btn:hover {
  transform: scale(1.15);
}

.is-mobile .circle-btn:hover {
  transform: none;
}

.circle-btn-inserting {
  opacity: 0.3;
}

.circle-btn-mode {
  left: 1em;
  right: auto;
  background-image: url('/icons/layers.svg');
}

.circle-btn-prev {
  right: 50%;
  margin: 0 1em 0 0;
  background-image: url('/icons/arrow-left.svg');
  background-size: 50% auto;
}

.circle-btn-next {
  left: 50%;
  margin: 0 0 0 1em;
  background-image: url('/icons/arrow-right.svg');
  background-size: 50% auto;
}

.circle-btn-prev .c-tip {
  transform: translateX(-0.9em);
}

.circle-btn-next .c-tip {
  transform: translateX(0.1em);
}

.empty-holder {
  font-size: 2.5em;
  font-weight: 300;
  color: #7f7f7f;
  text-align: center;
  margin: 4em 0 0 0;
}
</style>
