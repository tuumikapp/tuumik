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
    <div class="board-holder">
      <div
        v-for="inOutUser in inOutUsers"
        :key="inOutUser._id"
        :class="{ 'user-holder-on': editUser && inOutUser._id === editUser._id, 'is-recent': isRecent(inOutUser.inOutUpdateAt) }"
        class="user-holder"
        @click="openEditPopup(inOutUser)"
      >
        <div :style="avatarStyle(inOutUser)" class="avatar-holder"></div>
        <div :style="statusStyle(inOutUser.inOutStatus)" class="m-status">
          <span class="m-status2">{{ statusText(inOutUser.inOutStatus) }}</span>
        </div>
        <span class="m-name">{{ inOutUser.name }}</span>
        <span v-if="inOutUser.inOutETA" class="m-eta-desc"> ETA: {{ inOutUser.inOutETA }} </span>
        <span class="m-note">{{ inOutUser.inOutNote }}</span>
        <span class="m-bottom">
          <span v-if="isToday(inOutUser.inOutUpdateAt)" class="updated-today">
            {{ displayTime(inOutUser.inOutUpdateAt, true) }}
          </span>
          <span v-else-if="isYesterday(inOutUser.inOutUpdateAt)" class="updated-yesterday">
            {{ displayDate(inOutUser.inOutUpdateAt, true) }}
          </span>
          <span v-else class="updated-past">{{ displayDate(inOutUser.inOutUpdateAt, true) }}</span>
          <span v-if="inOutUser.inOutUpdateById && inOutUser.inOutUpdateById === inOutUser._id" class="m-updater-user">Self</span>
          <span v-else-if="inOutUser.inOutUpdateByName" class="m-updater-user">{{ inOutUser.inOutUpdateByName }}</span>
        </span>
      </div>
    </div>
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

function avatarStyle(inOutUser) {
  if (!inOutUser.pic) return false;
  return `background-image: url('${inOutUser.pic}');`;
}

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
.board-holder {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.user-holder {
  height: 20.7em;
  width: 14em;
  margin: 0 0.4em 0.4em 0;
  padding: 0.4em;
  background-color: #ffffff;
  position: relative;
  box-shadow: 0 0 0.9em 0 rgba(0, 0, 0, 0.07);
  border: 1px solid #cecece;
  border-radius: 0.3em;
}

.user-holder-on {
  outline: 3px solid #000000;
}

.avatar-holder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 14em;
  background-color: #e9e9e9;
  border: 1px solid #cecece;
  border-radius: 0.3em 0.3em 0 0;
  background-image: url('/icons/person.svg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
}

.m-status {
  position: absolute;
  top: 14em;
  left: 0;
  right: 0;
  height: 2em;
  line-height: 2em;
  padding: 0 0.6em;
  transition: background-color 1000ms ease-out, color 1000ms ease-out;
}

.m-status2 {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0.6em;
  right: 0.6em;
  overflow: hidden;
  white-space: nowrap;
}

.m-eta-desc {
  position: absolute;
  top: 12.7em;
  right: 0;
  padding: 0 0.3em;
  color: #e4e4e4;
  background-color: #1f1f1f;
  font-weight: 600;
  border-radius: 0.3em;
  overflow: hidden;
}

.m-name {
  position: absolute;
  top: 16.6em;
  left: 0.6em;
  right: 0.6em;
  color: #1f1f1f;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
}

.m-note {
  position: absolute;
  top: 19.1em;
  left: 0.6em;
  right: 0.6em;
  height: 2.4em;
  color: #1f1f1f;
  line-height: 1em;
  overflow: hidden;
}

.m-bottom {
  position: absolute;
  top: 17.7em;
  left: 0.6em;
  right: 0.6em;
  color: #1f1f1f;
  white-space: nowrap;
  overflow: hidden;
}

.m-updater-user {
  color: #4f4f4f;
  margin: 0 0 0 0.3em;
}
</style>
