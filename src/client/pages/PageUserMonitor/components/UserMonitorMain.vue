<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <div class="sm-second-menu">
      <span v-if="!generalStore.isMobile" class="sm-btn date-prev" @click="datePrev()"></span>
      <span v-if="!generalStore.isMobile" class="sm-btn date-next" @click="dateNext()"></span>
      <div v-if="!generalStore.isMobile" class="sm-divider"></div>
      <UserMonitorDate :monitor-date="monitorDate" />
      <div class="sm-items-right">
        <span v-if="dispMode === 'vert'" class="sm-btn vert-dec" @click="setSizeVert(-1)"></span>
        <span v-if="dispMode === 'vert'" class="sm-btn vert-inc" @click="setSizeVert(1)"></span>
      </div>
    </div>
    <div class="circle-btn" @click="showTeamsPopup = !showTeamsPopup">
      <span class="c-tip c-tip-rev">USERS</span>
    </div>
    <div v-if="dispMode === 'text'" class="circle-btn circle-btn-vert" @click="setDispMode('vert')">
      <span class="c-tip">VISUAL VIEW</span>
    </div>
    <div v-else class="circle-btn circle-btn-text" @click="setDispMode('text')">
      <span class="c-tip">TEXT VIEW</span>
    </div>
    <div class="circle-btn circle-btn-prev" @click="datePrev()">
      <span class="c-tip">PREVIOUS WEEK</span>
    </div>
    <div class="circle-btn circle-btn-next" @click="dateNext()">
      <span class="c-tip">NEXT WEEK</span>
    </div>
    <div v-if="dispMode === 'vert'" class="info-bar-vert">User monitor</div>
    <div v-if="dispMode === 'text'" class="info-bar-text">User monitor</div>
    <div :class="{ 'main-holder-vert': dispMode === 'vert', 'main-holder-text': dispMode === 'text' }">
      <UserMonitorDay v-for="targetDay in targetDays" :key="targetDay._id" :monitor-date="monitorDate" :target-day="targetDay" :target-user="targetUser" :disp-mode="dispMode" :size-vert="sizeVert" />
    </div>
    <div v-if="showTeamsPopup" class="teams-popup">
      <div class="teams-title">SHOW USER</div>
      <AutoComplete ac-type="users" hint="USERS" clear-after class="user-autocomplete-holder" @autocomplete-pick="addUserFromAc($event)" />
    </div>
    <div v-if="showTeamsPopup" class="teams-close" @click="showTeamsPopup = false"></div>

    <div v-if="loading" class="spinner spinner-global"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import isoWeek from 'dayjs/plugin/isoWeek';
import UserMonitorDate from './UserMonitorDate.vue';
import UserMonitorDay from './UserMonitorDay.vue';
import AutoComplete from '/src/client/components/AutoComplete/AutoComplete.vue';

dayjs.extend(utc);
dayjs.extend(isoWeek);

const router = useRouter();
const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();

const props = defineProps({
  monitorDate: { type: Number, required: true },
  dateStr: { type: String, required: true },
});

const targetDays = ref([]);
const targetUser = ref({});
const loading = ref(false);
const showTeamsPopup = ref(false);
const selectedUser = ref(null);
const dispMode = ref('vert');
const sizeVert = ref(10);

dispMode.value = localStorage.userMonitorDispMode ? localStorage.userMonitorDispMode : 'vert';
sizeVert.value = localStorage.monitorSizeVert ? Number(localStorage.monitorSizeVert) : 10;

watch(() => props.monitorDate, (to, from) => {
  loadData();
});

onMounted(() => {
  loadData();
});

async function loadData() {
  loading.value = true;
  const period = generalStore.tenant.weekStart === 'mon' ? 'isoWeek' : 'week';
  const startUTC = dayjs.utc(props.dateStr).startOf(period).toDate();
  const endUTC = dayjs.utc(props.dateStr).endOf(period).toDate();
  const startLocal = dayjs(props.dateStr).startOf(period).toDate();
  const endLocal = dayjs(props.dateStr).endOf(period).toDate();
  const dates = { startUTC, endUTC, startLocal, endLocal };
  const userId = selectedUser.value?._id || '';
  try {
    const res = await Meteor.callAsync('userMonitorLoad', dates, userId, userId);
    processData(res);
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function processData(res) {
  // create a days array
  const days = [];
  let currentDay = dayjs.utc(res.dates.startUTC).toDate();
  while (currentDay < res.dates.endUTC) {
    const dateStr = dayjs(currentDay).format('YYYY-MM-DD');
    const dateUTC = dayjs.utc(dateStr, 'YYYY-MM-DD').hour(0).minute(0).second(0).millisecond(1).toDate();
    const startLocal = dayjs(dateStr, 'YYYY-MM-DD').startOf('day').toDate();
    const endLocal = dayjs(dateStr, 'YYYY-MM-DD').endOf('day').toDate();
    days.push({ dateUTC, startLocal, endLocal });
    currentDay = dayjs.utc(currentDay).add(1, 'day').toDate();
  }
  const step1 = days;

  // move times and statuses into correct days
  const step2 = step1.map(targetDay => {
    const statuses = [];
    const times = [];
    for (const status of res.statuses) {
      const t = targetDay;
      const s = status;
      if ((s.start > t.startLocal && s.start < t.endLocal) || (s.end > t.startLocal && s.end < t.endLocal) || (s.start < t.startLocal && s.end > t.endLocal)) statuses.push(status);
    }
    for (const time of res.times) {
      if (time.date.getTime() === targetDay.dateUTC.getTime()) times.push(time);
    }
    return { ...targetDay, statuses, times };
  });

  // fix status items that start before start of day
  const step3 = step2.map(targetDay => {
    const startOfDay = targetDay.startLocal;
    const statuses = targetDay.statuses.map(statusItem => {
      if (statusItem.start < startOfDay) return { ...statusItem, start: startOfDay };
      return { ...statusItem };
    });
    return { ...targetDay, statuses };
  });

  // fix status items that end after end of day
  const step4 = step3.map(targetDay => {
    const endOfDay = targetDay.endLocal;
    const statuses = targetDay.statuses.map(statusItem => {
      if (statusItem.end > endOfDay) return { ...statusItem, end: endOfDay };
      return { ...statusItem };
    });
    return { ...targetDay, statuses };
  });

  // add last status item from user's current status
  const nowDate = new Date();
  const step5 = step4.map(targetDay => {
    const startOfDay = targetDay.startLocal;
    const endOfDay = targetDay.endLocal;
    if (res.targetUser.inOutUpdateAt < endOfDay && startOfDay < nowDate) {
      const n = targetDay;
      const newStatus = {
        userId: res.targetUser._id,
        status: res.targetUser.inOutStatus,
        start: res.targetUser.inOutUpdateAt > startOfDay ? res.targetUser.inOutUpdateAt : startOfDay,
        end: nowDate < endOfDay ? nowDate : endOfDay,
      };
      n.statuses.push(newStatus);
      return n;
    }
    return targetDay;
  });

  // join status options into statuses
  const inOutOptions = generalStore.tenant.inOutOptions;
  const step6 = step5.map(targetDay => {
    const statuses = targetDay.statuses.map(statusItem => {
      const currentOpt = inOutOptions.find(opt => opt.id === statusItem.status);
      if (currentOpt) return { ...statusItem, ...currentOpt };
      const unknownOpt = {
        text: 'UNDEFINED',
        work: false,
        colorBG: '#3f3f3f',
        colorTxt: '#ffffff',
      };
      return { ...statusItem, ...unknownOpt };
    });
    return { ...targetDay, statuses };
  });

  // calculate status statistics
  const step7 = step6.map(targetDay => {
    let workTotal = 0;
    for (const statusItem of targetDay.statuses) {
      if (statusItem.work) workTotal += statusItem.end - statusItem.start;
    }
    return { ...targetDay, workTotal };
  });

  // calculate times statistics
  const step8 = step7.map(targetDay => {
    let timesTotal = 0;
    for (const time of targetDay.times) {
      timesTotal += time.endMinute - time.startMinute;
    }
    return { ...targetDay, timesTotal };
  });

  targetDays.value = step8;
  targetUser.value = res.targetUser;
}

function datePrev() {
  const monitorDate = dayjs(props.monitorDate).subtract(1, 'weeks').format('YYYY-MM-DD');
  router.push({ name: 'userMonitor', params: { monitorDate } });
}

function dateNext() {
  const monitorDate = dayjs(props.monitorDate).add(1, 'weeks').format('YYYY-MM-DD');
  router.push({ name: 'userMonitor', params: { monitorDate } });
}

function setDispMode(str) {
  dispMode.value = str;
  localStorage.userMonitorDispMode = str;
}

function setSizeVert(change) {
  let targetSize = sizeVert.value + change;
  if (targetSize < 6) {
    targetSize = 6;
  } else if (targetSize > 40) {
    targetSize = 40;
  }
  sizeVert.value = targetSize;
  localStorage.monitorSizeVert = targetSize;
}

function addUserFromAc(result) {
  selectedUser.value = result;
  loadData();
}
</script>

<style scoped>
.date-prev,
.date-next {
  width: 2.5em;
  background-image: url('/icons/arrow-right.svg');
  background-repeat: no-repeat;
  background-size: auto 55%;
  background-position: center center;
  z-index: 1;
}

.date-prev {
  background-image: url('/icons/arrow-left.svg');
}

.vert-dec {
  width: 2.5em;
  background-image: url('/icons/minus.svg');
  background-repeat: no-repeat;
  background-size: auto 75%;
  background-position: center center;
}

.vert-inc {
  width: 2.5em;
  background-image: url('/icons/plus.svg');
  background-repeat: no-repeat;
  background-size: auto 75%;
  background-position: center center;
}

/* CIRCLE BUTTONS */
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
  background-image: url('/icons/team.svg');
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

.circle-btn-vert {
  left: 1em;
  right: auto;
  background-image: url('/icons/layers.svg');
}

.circle-btn-text {
  left: 1em;
  right: auto;
  background-image: url('/icons/list.svg');
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
/* /CIRCLE BUTTONS */

.info-bar-vert {
  position: fixed;
  top: 6em;
  left: 0;
  right: 0;
  height: 4em;
  padding: 0 1.2em;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  z-index: 10;
}

.info-bar-text {
  margin: 8em 1em 1em 1em;
}

.main-holder-vert {
  display: flex;
  padding: 0 0 0 1em; /* for right padding to work set here 'display: inline-flex' */
  margin: 0 0 9em 0;
}

.main-holder-text {
  padding: 1em;
  margin: 0 0 9em 0;
}

/* TEAM POPUP */
.teams-popup {
  position: fixed;
  top: 9em;
  left: 0;
  right: 0;
  margin: 0 auto;
  padding: 1em;
  width: 19em;
  max-height: 60vh;
  background-color: #ffffff;
  border-radius: 0.2em;
  box-shadow: 0.3em 0.3em 0em 0em rgba(0, 0, 0, 0.1);
  z-index: 1021;
}

.is-mobile .teams-popup {
  top: 10em;
  width: 80vw;
}

.teams-close {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: black;
  opacity: 0.4;
  z-index: 1020;
}

.teams-title {
  margin: 0;
  color: #7f7f7f;
  text-align: center;
  font-weight: 600;
}

.user-autocomplete-holder {
  margin: 0 0 2em 0;
}

.teams-ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  border-radius: 0.3em;
  max-height: 60vh;
  overflow-y: auto;
}

.teams-li {
  margin: 1px 0;
  padding: 0.6em 0.8em;
  background-color: #e0e0e0;
  user-select: none;
}

.teams-li:hover {
  background-color: #f1f1f1;
}

.teams-li-on {
  background-color: #00ab6a;
  color: #ffffff;
}

.teams-li-on:hover {
  background-color: #02c97c;
}
/* /TEAM POPUP */
</style>
