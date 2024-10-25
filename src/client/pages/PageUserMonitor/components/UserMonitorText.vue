<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="user-holder">
    <div class="headerbar">
      <div :style="avatarStyle(targetUser)" class="avatar-holder"></div>
      <div v-if="targetUser && targetUser.name" class="hb-name">{{ targetUser.name }}</div>
      <div>{{ displayDate(targetDay.dateUTC, false, 'dddd') }}</div>
      <div>{{ displayDate(targetDay.dateUTC) }}</div>
      <div class="hb-work">Worked: {{ displayDuration3(targetDay.workTotal) }}</div>
      <div class="hb-time">Tracked: {{ displayDuration2(targetDay.timesTotal) }}</div>
    </div>
    <table v-if="!generalStore.isMobile" class="timetable">
      <tr v-for="time in targetDay.times" :key="time._id" class="ttr">
        <td class="ttd ttime">{{ displayTimeFromMinutes(time.startMinute) }} - {{ displayTimeFromMinutes(time.endMinute) }}</td>
        <td class="ttd tduration">{{ displayDuration(time) }}</td>
        <td class="ttd tclient">
          <span v-if="time.clientName">{{ time.clientName }}</span>
          <span v-else>-</span>
        </td>
        <td class="ttd tproject">
          <span v-if="time.projectName">{{ time.projectName }}</span>
          <span v-else>-</span>
        </td>
        <td class="ttd ttask">
          <span v-if="time.useTaskType">{{ time.taskType }} </span>{{ time.taskDesc }}
          <div v-if="time.intCom" class="intcom">{{ time.intCom }}</div>
        </td>
      </tr>
    </table>

    <div v-else class="times-holder">
      <div v-for="time in targetDay.times" :key="time._id" class="times-row">
        <span class="ttime">
          {{ displayTimeFromMinutes(time.startMinute) }} -
          {{ displayTimeFromMinutes(time.endMinute) }}
        </span>
        &bull;
        <span class="mduration">{{ displayDuration(time) }}</span>
        &bull;
        <span class="tclient">
          <span v-if="time.clientName">{{ time.clientName }}</span>
          <span v-else>-</span>
        </span>
        &bull;
        <span class="tproject">
          <span v-if="time.projectName">{{ time.projectName }}</span>
          <span v-else>-</span>
        </span>
        &bull;
        <span class="ttask">
          <span v-if="time.useTaskType">{{ time.taskType }} </span>{{ time.taskDesc }}
          <div v-if="time.intCom" class="intcom">{{ time.intCom }}</div>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGeneralStore } from '/src/client/stores/general.js';
import dayjs from 'dayjs';
import { minutesToDuration } from '/src/shared/utils/time.js';

const generalStore = useGeneralStore();

const props = defineProps({
  targetDay: { type: Object, required: true },
  targetUser: { type: Object, required: true },
});

function avatarStyle(targetUser) {
  if (!targetUser.pic) return false;
  return `background-image: url('${targetUser.pic}');`;
}

function displayDate(date, notUtc, customFormat) {
  const format = customFormat || generalStore.tenant.dateFormat;
  return !notUtc ? dayjs.utc(date).format(format) : dayjs(date).format(format);
}

function displayTimeFromMinutes(minutes) {
  const timeFormat = generalStore.tenant.timeFormat || 'HH:mm';
  return dayjs().hour(0).minute(minutes).format(timeFormat);
}

function displayDuration(time) {
  const x = time.endMinute - time.startMinute;
  return minutesToDuration(x);
}

function displayDuration2(minutes) {
  return minutesToDuration(minutes);
}

function displayDuration3(millis) {
  const minutes = Math.floor(millis / 60000);
  return minutesToDuration(minutes);
}
</script>

<style scoped>
.user-holder {
  margin: 0 0 3em 0;
}

.headerbar {
  height: 10em;
  border-bottom: 10px solid #cecece;
  padding: 0 0 0 10em;
  display: flex;
  flex-direction: column;
  position: relative;
}

.avatar-holder {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 9em;
  width: 9em;
  margin: 0 1em 0 0;
  background-color: #e9e9e9;
  border: 1px solid #cecece;
  border-radius: 0.3em 0.3em 0 0;
  background-image: url('/icons/person.svg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
}

.hb-name {
  font-weight: 600;
  margin: 0.7em 0 0 0;
}

.hb-work {
  color: #e04f15;
  margin: 0 0 0 0;
}

.hb-time {
  margin: 0 0 0 0;
}

/* TIMES WEB */
.timetable {
  width: 100%;
  border-collapse: collapse;
  color: #1f1f1f;
  margin: 0 0 3em 0;
}

.ttr {
  animation: timein 1000ms 0ms ease;
}

.ttd {
  border: 1px solid #cecece;
  padding: 0.4em 0.9em;
  vertical-align: top;
}

.ttime {
  width: 9em;
}

.tduration {
  width: 4.2em;
}

.tclient {
  width: 15%;
}

.tproject {
  width: 30%;
}

.ttask {
  color: #000000;
}
/* /TIMES WEB */

/* TIMES MOBILE */
.times-holder {
  margin: 0 0 1em 0;
}

.times-row {
  padding: 0.4em 0;
  animation: timein 1000ms 0ms ease;
}

.mduration {
  color: #ff0033;
}
/* /TIMES MOBILE */

.intcom {
  color: #0060ff;
}

@keyframes timein {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>
