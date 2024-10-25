<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="icon-inout" @click.self="showBox = true">
    <div :style="circleStyle()" class="i-circle" @click.self="showBox = true"></div>
    <div v-if="loading" class="i-spinner" @click.self="showBox = true"></div>
    <div v-if="showBox" :style="{ fontSize: generalStore.zoomBody + 'px' }" :class="{ 'i-box-no-link': !generalStore.user.permissions.inOutView || route.path === '/inout' }" class="i-box">
      <div class="status-holder">
        <div
          v-for="inOutOption in generalStore.tenant.inOutOptions"
          :key="inOutOption.id"
          :class="{ 'statusrow-on': generalStore.user.inOutStatus === inOutOption.id }"
          class="statusrow"
          @click="setInOutStatus(inOutOption.id); showBox = false;"
        >
          {{ inOutOption.text }}
          <div :style="{ backgroundColor: inOutOption.colorBG }" class="statusrow-circle"></div>
        </div>
      </div>
      <ul class="eta-ul">
        <li class="eta-li" @click="setInOutETA('clear')">CLEAR</li>
        <li class="eta-li" @click="setInOutETA('15m')">15m</li>
        <li class="eta-li" @click="setInOutETA('30m')">30m</li>
        <li class="eta-li" @click="setInOutETA('1h')">1h</li>
        <li class="eta-li" @click="setInOutETA('2h')">2h</li>
        <li class="eta-li" @click="setInOutETA('3h')">3h</li>
        <li class="eta-li" @click="setInOutETA('4h')">4h</li>
        <li class="eta-li" @click="setInOutETA('evening')">EVENING</li>
        <li class="eta-li" @click="setInOutETA('tomorrow')">TOMORROW</li>
      </ul>
      <RouterLink v-if="generalStore.user.permissions.inOutView && route.path !== '/inout'" to="/inout" class="board-link">
        GO TO IN/OUT BOARD
      </RouterLink>
      <div class="note-text" @click="noteNew = generalStore.user.inOutNote; showNoteInput = true;">
        {{ generalStore.user.inOutNote }}
      </div>
      <form v-if="showNoteInput" class="note-form" @submit.prevent="setInOutNote(); showNoteInput = false;">
        <input v-model="noteNew" type="text" maxlength="200" placeholder="NOTE" class="note-input" />
        <input type="submit" value="ENTER" class="note-btn-submit" />
        <span class="note-clear-btn" @click="clearInOutNote()">CLEAR</span>
        <span class="note-cancel-btn" @click="showNoteInput = false">
          CANCEL
        </span>
      </form>
    </div>
    <div v-if="showBox" class="i-close" @click="showBox = false"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Meteor } from 'meteor/meteor';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';

const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();
const route = useRoute();

const showBox = ref(false);
const showNoteInput = ref(false);
const noteNew = ref('');
const loading = ref(false);

function circleStyle() {
  const status = generalStore.user.inOutStatus;
  const inOutOptions = generalStore.tenant.inOutOptions;
  const currentOption = inOutOptions.find(x => x.id === status);
  const colorBG = currentOption ? currentOption.colorBG : '#3f3f3f';
  const colorTxt = currentOption ? currentOption.colorTxt : '#000000';
  return `background-color: ${colorBG}; color: ${colorTxt};`;
}

async function setInOutStatus(status) {
  loading.value = true;
  try {
    await Meteor.callAsync('setInOutStatusSelf', status);
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function setInOutNote() {
  loading.value = true;
  try {
    await Meteor.callAsync('setInOutNoteSelf', noteNew.value);
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function clearInOutNote() {
  noteNew.value = '';
  setInOutNote();
  showNoteInput.value = false;
}

function makeETADesc(eta) {
  const dateFormat = generalStore.tenant.dateFormat;
  const timeFormat = generalStore.tenant.timeFormat;
  if (eta === 'clear') return '';
  if (eta === '15m') return `${dayjs().add(15, 'minutes').format(timeFormat)} (15m)`;
  if (eta === '30m') return `${dayjs().add(30, 'minutes').format(timeFormat)} (30m)`;
  if (eta === '1h') return `${dayjs().add(1, 'hours').format(timeFormat)} (1h)`;
  if (eta === '2h') return `${dayjs().add(2, 'hours').format(timeFormat)} (2h)`;
  if (eta === '3h') return `${dayjs().add(3, 'hours').format(timeFormat)} (3h)`;
  if (eta === '4h') return `${dayjs().add(4, 'hours').format(timeFormat)} (4h)`;
  if (eta === 'evening') return `${dayjs().format(dateFormat)} (evening)`;
  if (eta === 'tomorrow') return `${dayjs().add(1, 'days').format(dateFormat)} (tomorrow)`;
  return '';
}

async function setInOutETA(eta) {
  loading.value = true;
  const desc = makeETADesc(eta);
  try {
    await Meteor.callAsync('setInOutETASelf', desc);
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}
</script>

<style scoped>
.icon-inout {
  height: 3em;
  width: 3em;
  margin: 0 0.4em;
  position: relative;
}

.is-mobile .icon-inout {
  margin: 0 0.6em;
}

.i-circle {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 1.5em;
  height: 1.5em;
  margin: auto;
  border: 1px solid #6f6f6f;
  background-color: #3f3f3f;
  border-radius: 50%;
}

.i-spinner {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 1.7em;
  height: 1.7em;
  margin: auto;
  background-repeat: no-repeat;
  background-size: auto 50%;
  background-position: center center;
  background-image: url('/icons/conicon-connecting.svg');
  animation: spinner 3000ms 0ms infinite forwards linear;
}

.i-box {
  position: absolute;
  top: 4em;
  right: 0;
  width: 14em;
  min-height: 20em;
  padding: 8em 7em 0 0;
  text-align: center;
  background-color: #ffffff;
  border-radius: 0.2em;
  box-shadow: 0.3em 0.3em 0em 0em rgba(0, 0, 0, 0.1);
  z-index: 1021;
}

.is-mobile .i-box {
  position: fixed;
  top: 4em;
  left: 0;
  right: 0;
  width: 14em;
  max-width: 90vw;
  max-height: 80vh;
  margin: 0 auto;
  padding: 8em 7em 0 0;
}

.icon-inout .i-box-no-link {
  padding: 4em 7em 0 0;
}

.i-close {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: black;
  opacity: 0.4;
  z-index: 1020;
}

.eta-ul {
  position: absolute;
  top: 8em;
  bottom: 0;
  right: 0.3em;
  width: 6.7em;
  margin: 0;
  padding: 0;
  list-style-type: none;
  overflow-y: auto;
}

.i-box-no-link .eta-ul {
  top: 4em;
}

.eta-li {
  margin: 0.3em 0;
  padding: 0.6em 0.2em;
  background-color: #e0e0e0;
  user-select: none;
}

.eta-li:hover {
  background-color: #f1f1f1;
}

.is-mobile .eta-li {
  padding: 1em 0.2em;
}

.board-link {
  position: absolute;
  top: 0.3em;
  left: 0.3em;
  right: 0.3em;
  height: 3.7em;
  line-height: 3.7em;
  background-color: #e0e0e0;
  cursor: pointer;
}

.board-link:hover {
  background-color: #f1f1f1;
}

.note-text {
  position: absolute;
  top: 4.3em;
  left: 0.3em;
  right: 0.3em;
  height: 2.6em;
  padding: 0.5em;
  background-color: #e0e0e0;
  color: #1f1f1f;
  overflow-y: auto;
  display: flex;
  justify-content: left;
  align-items: center;
  text-align: left;
}

.note-text:hover {
  background-color: #f1f1f1;
}

.i-box-no-link .note-text {
  top: 0.3em;
}

.note-form {
  position: absolute;
  top: 4.3em;
  left: 0.3em;
  right: 0.3em;
  height: 7.9em;
  background-color: #f9f9f9;
}

.i-box-no-link .note-form {
  top: 0.3em;
}

.note-input {
  height: 3.6em;
  width: 100%;
}

.note-btn-submit {
  position: absolute;
  top: 3.9em;
  right: 0;
  height: 3.6em;
  line-height: 3.6em;
  padding: 0;
  width: 39%;
  background-color: #00ab6a;
  color: #f9f9f9;
  border: none;
  border-radius: 0.3em;
  font-weight: 600;
  user-select: none;
}

.note-btn-submit:hover {
  background-color: #02c97c;
  color: #ffffff;
}

.note-clear-btn {
  position: absolute;
  top: 3.9em;
  left: 0;
  right: 0;
  margin: 0 auto;
  height: 3.6em;
  line-height: 3.6em;
  padding: 0;
  width: 20%;
  background-color: #b9b9b9;
  color: black;
  border-radius: 0.3em;
  user-select: none;
}

.note-clear-btn:hover {
  background-color: #c4c4c4;
}

.note-cancel-btn {
  position: absolute;
  top: 3.9em;
  left: 0;
  height: 3.6em;
  line-height: 3.6em;
  padding: 0;
  width: 39%;
  background-color: #b9b9b9;
  color: black;
  border-radius: 0.3em;
  user-select: none;
}

.note-cancel-btn:hover {
  background-color: #c4c4c4;
}

.status-holder {
  overflow-y: auto;
  max-height: 60vh;
}

.statusrow {
  padding: 1em 4em 1em 1em;
  background-color: #e0e0e0;
  margin: 0.3em;
  text-align: right;
  position: relative;
  user-select: none;
}

.statusrow:hover {
  background-color: #f1f1f1;
}

.statusrow-on {
  outline: 2px solid #00ab6a;
}

.statusrow-circle {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0.8em;
  width: 1.5em;
  height: 1.5em;
  margin: auto;
  border: 1px solid #6f6f6f;
  background-color: #3f3f3f;
  border-radius: 50%;
}
</style>
