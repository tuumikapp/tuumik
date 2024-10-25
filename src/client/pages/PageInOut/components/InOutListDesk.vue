<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <div v-if="selectedUser" class="sel-user">
      Showing user:
      {{ selectedUser.name }}
    </div>
    <div v-else-if="selectedTeam" class="sel-team">
      Showing team:
      {{ selectedTeam.name }}
    </div>
    <table class="desk-board">
      <tr>
        <th class="tth">Status</th>
        <th class="tth">Name</th>
        <th class="tth">Note</th>
        <th class="tth">Updated</th>
      </tr>
      <tr
        v-for="inOutUser in inOutUsers"
        :key="inOutUser._id"
        :class="{ 'ttr-on': editUser && inOutUser._id === editUser._id, 'is-recent': isRecent(inOutUser.inOutUpdateAt) }"
        class="ttr"
        @click="openEditPopup(inOutUser)"
      >
        <td :style="statusStyle(inOutUser.inOutStatus)" class="ttd tstatus">
          {{ statusText(inOutUser.inOutStatus) }}
        </td>
        <td class="ttd tname">{{ inOutUser.name }}</td>
        <td class="ttd tnote">
          <span v-if="inOutUser.inOutETA" class="eta-desc"> ETA: {{ inOutUser.inOutETA }} </span>
          <span v-if="inOutUser.inOutETA && inOutUser.inOutNote" class="spacer-bullet">
            &bull;
          </span>
          {{ inOutUser.inOutNote }}
        </td>
        <td class="ttd tupdate">
          <span v-if="isToday(inOutUser.inOutUpdateAt)" class="updated-today">
            {{ displayTime(inOutUser.inOutUpdateAt, true) }}
          </span>
          <span v-else-if="isYesterday(inOutUser.inOutUpdateAt)" class="updated-yesterday">
            {{ displayDate(inOutUser.inOutUpdateAt, true) }}
          </span>
          <span v-else class="updated-past">{{ displayDate(inOutUser.inOutUpdateAt, true) }}</span>
          <span v-if="inOutUser.inOutUpdateById && inOutUser.inOutUpdateById === inOutUser._id" class="updater-user">Self</span>
          <span v-else-if="inOutUser.inOutUpdateByName" class="updater-user">{{ inOutUser.inOutUpdateByName }}</span>
        </td>
      </tr>
    </table>
  </div>
</template>

<script setup>
import { useGeneralStore } from '/src/client/stores/general.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const generalStore = useGeneralStore();

const props = defineProps({
  inOutUsers: { type: Array, required: true },
  editUser: { type: [null, Object], required: true },
  selectedTeam: { type: [null, Object], required: true },
  selectedUser: { type: [null, Object], required: true },
  timeNow: { type: Date, required: true },
});

const emit = defineEmits(['set-edit-user']);

function statusStyle(inOutStatus) {
  const inOutOptions = generalStore.tenant.inOutOptions;
  const opt = inOutOptions.find(x => x.id === inOutStatus);
  const colorBG = opt?.colorBG ? opt.colorBG : '#3f3f3f';
  const colorTxt = opt?.colorTxt ? opt.colorTxt : '#000000';
  return `background-color: ${colorBG}; color: ${colorTxt};`;
}

function statusText(inOutStatus) {
  const inOutOptions = generalStore.tenant.inOutOptions;
  const opt = inOutOptions.find(x => x.id === inOutStatus);
  return opt?.text ? opt.text : '-';
}

function displayDate(date, notUtc, customFormat) {
  const format = customFormat || generalStore.tenant.dateFormat;
  return !notUtc ? dayjs.utc(date).format(format) : dayjs(date).format(format);
}

function displayTime(date, notUtc, customFormat) {
  const format = customFormat || generalStore.tenant.timeFormat;
  return !notUtc ? dayjs.utc(date).format(format) : dayjs(date).format(format);
}

function isRecent(dt) {
  if (dayjs(dt).diff(props.timeNow, 'minutes') >= -5) return true;
  return false;
}

function isToday(dt) {
  if (dayjs(dt).isSame(props.timeNow, 'day')) return true;
  return false;
}

function isYesterday(dt) {
  const yesterday = dayjs(props.timeNow).subtract(1, 'days');
  if (dayjs(dt).isSame(yesterday, 'day')) return true;
  return false;
}

function openEditPopup(inOutUser) {
  if (generalStore.user.permissions.inOutEditOthers) emit('set-edit-user', inOutUser);
}
</script>

<style scoped>
.desk-board {
  width: 100%;
  border-collapse: collapse;
  color: #1f1f1f;
}

.tth {
  border: 1px solid #cecece;
  padding: 0.6em 0.4em;
  text-align: left;
}

.ttr:hover {
  background-color: #f9f9f9;
}

.ttr-on {
  outline: 3px solid #095309;
}

.ttd {
  border: 1px solid #cecece;
  padding: 0.4em 0.4em;
  vertical-align: top;
}

.tstatus {
  width: 10em;
  color: #1f1f1f;
  transition: background-color 1000ms ease-out, color 1000ms ease-out;
}

.tname {
  width: 20em;
}

.tnote {
  color: #1f1f1f;
}

.spacer-bullet {
  color: #6f6f6f;
}

.tupdate {
  width: 16em;
}

.eta-desc {
  color: #0e4d0e;
  font-weight: 600;
}

.updated-today {
  color: #afafaf;
  transition: color 1000ms ease-out;
}

.is-recent .updated-today {
  color: #3366ff;
}

.updated-yesterday {
  color: #7f7f7f;
}

.updated-past {
  color: #4f4f4f;
}

.updater-user {
  color: #4f4f4f;
  margin: 0 0 0 0.3em;
}
</style>
