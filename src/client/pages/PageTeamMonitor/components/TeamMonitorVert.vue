<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="user-holder">
    <div class="headerbar">
      <div :style="avatarStyle(targetUser)" class="avatar-holder"></div>
      <div v-if="targetUser && targetUser.name" class="hb-name">{{ targetUser.name }}</div>
      <div class="hb-work">{{ displayDuration3(targetUser.workTotal) }}</div>
      <div class="hb-time">{{ displayDuration2(targetUser.timesTotal) }}</div>
    </div>
    <div :style="{ backgroundImage: baseBackground().image, backgroundSize: baseBackground().size }" class="times-base">
      <TeamMonitorRuler />
      <div v-for="status in targetUser.statuses" :key="status._id" :style="statusboxStyle(status)" class="statusbox-vert">
        <div :style="statusboxPopupStyle(status)" class="statusbox-popup">
          <div class="spopup-text">{{ status.text }}</div>
          <div class="spopup-dur">{{ displayDuration4(status) }}</div>
        </div>
      </div>
      <div v-for="time in targetUser.times" :key="time._id" :style="timeboxStyle(time)" class="timebox-vert" @mouseover="setExpansionDirection($event)">
        <ul :class="{ 'flip-expansion': flipExpansion }" class="ul-vert">
          <li>
            <span v-if="time.clientName" class="client-name">{{ time.clientName }}</span>
            <span v-else>-</span>
          </li>
          <li>
            <span v-if="time.projectName" class="project-name">{{ time.projectName }}</span>
            <span v-else>-</span>
          </li>
          <li>
            <span v-if="time.useTaskType">{{ time.taskType }} </span>{{ time.taskDesc }}
          </li>
          <li v-if="time.intCom" class="intcom">{{ time.intCom }}</li>
          <li>{{ displayDuration(time) }}</li>
          <li>{{ displayTimeFromMinutes(time.startMinute) }} - {{ displayTimeFromMinutes(time.endMinute) }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import dayjs from 'dayjs';
import TeamMonitorRuler from './TeamMonitorRuler.vue';
import { minutesToDuration } from '/src/shared/utils/time.js';

const generalStore = useGeneralStore();

const props = defineProps({
  targetUser: { type: Object, required: true },
});

const flipExpansion = ref(false);

function baseBackground() {
  const trackerStep = generalStore.tenant.trackerStep;
  const step = trackerStep === 1 ? 6 : trackerStep;
  const pixelsPerMinute = 2;
  const gridStep = pixelsPerMinute * step;
  const image = `linear-gradient(to bottom, #ffffff, #ffffff ${gridStep - 1}px, #f0f0f0 ${gridStep - 1}px, #f0f0f0 ${gridStep}px)`;
  const size = `auto ${gridStep}px`;
  return { image, size };
}

function statusboxStyle(status) {
  const pixelsPerMinute = 2;
  const startMinute = status.start.getHours() * 60 + status.start.getMinutes();
  const endMinute = status.end.getHours() * 60 + status.end.getMinutes();
  const top = startMinute * pixelsPerMinute;
  const bottom = (1440 - endMinute) * pixelsPerMinute;
  return `top: ${top}px; bottom: ${bottom}px; background-color: ${status.colorBG};`;
}

function statusboxPopupStyle(status) {
  return `color: ${status.colorTxt}; background-color: ${status.colorBG};`;
}

function timeboxStyle(time) {
  const pixelsPerMinute = 2;
  const top = time.startMinute * pixelsPerMinute;
  const bottom = (1440 - time.endMinute) * pixelsPerMinute + 1;
  let color = time.projectId && time.taskDesc && (!time.useTaskType || time.taskType) ? 'rgba(138, 245, 138, 0.7)' : 'rgba(230, 230, 230, 0.7)';
  if (time.plan) color = 'rgba(156, 184, 230, 0.7)';
  return `top: ${top}px; bottom: ${bottom}px; background-color: ${color};`;
}

function avatarStyle(targetUser) {
  if (!targetUser.pic) return false;
  return `background-image: url('${targetUser.pic}');`;
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

function displayDuration4(status) {
  const millis = status.end - status.start;
  const minutes = Math.floor(millis / 60000);
  return minutesToDuration(minutes);
}

function setExpansionDirection(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const viewportWidth = document.body.clientWidth;
  const spacetoRight = viewportWidth - rect.left;
  const popupWidth = (20 + 3) * generalStore.zoomBody;
  if (popupWidth < spacetoRight) {
    flipExpansion.value = false;
  } else {
    flipExpansion.value = true;
  }
}
</script>

<style scoped>
.user-holder {
  width: 10em;
  margin: 4em 1.2em 0 0;
  border: 1px solid #cecece;
  border-radius: 0.3em;
}

.headerbar {
  position: -webkit-sticky;
  position: sticky;
  top: 10em;
  height: 6em;
  margin: -1px -1px 0 -1px;
  background-color: #e0e0e0;
  border: 1px solid #cecece;
  border-radius: 0.3em;
  z-index: 1;
}

.avatar-holder {
  position: absolute;
  top: 0;
  left: 0;
  height: 5.8em;
  width: 5.8em;
  background-color: #e9e9e9;
  border: 1px solid #cecece;
  border-radius: 0.3em 0.3em 0 0;
  background-image: url('/icons/person.svg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
}

.hb-name {
  position: absolute;
  top: 0.3em;
  left: 6.4em;
  right: 0;
  font-weight: 600;
  overflow: hidden;
  white-space: nowrap;
}

.hb-work {
  position: absolute;
  top: 1.6em;
  left: 6.4em;
  right: 0;
  color: #e04f15;
  overflow: hidden;
  white-space: nowrap;
}

.hb-time {
  position: absolute;
  top: 2.8em;
  left: 6.4em;
  right: 0;
  overflow: hidden;
  white-space: nowrap;
}

.times-base {
  width: 100%;
  height: 2880px;
  position: relative;
}

.statusbox-vert {
  position: absolute;
  left: 2.7em;
  width: 0.6em;
  animation: timein 1000ms 0ms ease;
}

.statusbox-vert:hover {
  background-color: orange !important;
}

.statusbox-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 7em;
  width: 14em;
  padding: 0.6em 1em;
  margin: 0 auto;
  z-index: 1000;
  text-align: center;
  border-radius: 0.4em;
  background-color: orange;
  border: 1px solid #1f1f1f;
  display: none;
}

.statusbox-vert:hover .statusbox-popup {
  display: block;
}

.spopup-text {
  font-weight: 600;
}

.spopup-dur {
  opacity: 0.9;
}

.timebox-vert {
  position: absolute;
  left: 3.6em;
  right: 0.2em;
  overflow: hidden;
  border-top: 1px solid #2f2f2f;
  border-bottom: 1px solid #2f2f2f;
  animation: timein 1000ms 0ms ease;
}

.timebox-vert:hover {
  background-color: orange !important;
  overflow: visible;
}

.ul-vert {
  list-style-type: none;
  margin: 0.1em 0.3em;
  padding: 0;
  white-space: nowrap;
  color: #2d2d2d;
  transition: margin 100ms ease-out;
}

.timebox-vert:hover .ul-vert {
  position: absolute;
  top: 0;
  left: 0;
  width: 20em;
  white-space: normal;
  background-color: #f7bc4e;
  margin: 0 0 0 3em;
  padding: 1em;
  z-index: 10;
  box-shadow: 0.3em 0.3em 0em 0em rgba(0, 0, 0, 0.1);
}

.timebox-vert:hover .flip-expansion {
  left: auto;
  right: 0;
  margin: 0 3em 0 0;
}

@keyframes timein {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.client-name {
  font-weight: 600;
}

.project-name {
  font-weight: 600;
}
</style>
