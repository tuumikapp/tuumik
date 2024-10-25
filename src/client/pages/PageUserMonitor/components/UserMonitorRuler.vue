<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="ruler">
    <div v-for="hour in hours" :key="hour" :style="{ top: holderTop(hour), lineHeight: holderLineHeight() }" class="hour-holder">
      <mark :id="hourId(hour)" class="rmk">{{ hourText(hour) }}</mark>
      {{ minutesText(hour) }}
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';

const generalStore = useGeneralStore();

const hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

onMounted(() => {
  document.getElementById('at0600').scrollIntoView();
});

function holderTop(hour) {
  const startMinute = hour * 60;
  const pixelsPerMinute = 2;
  const { trackerStep } = generalStore.tenant;
  const step = trackerStep === 1 ? 6 : trackerStep;
  const shiftToCenter = (pixelsPerMinute * step) / 2;
  return `${pixelsPerMinute * startMinute - shiftToCenter}px`;
}

function holderLineHeight() {
  const { trackerStep } = generalStore.tenant;
  const step = trackerStep === 1 ? 6 : trackerStep;
  const pixelsPerMinute = 2;
  return `${pixelsPerMinute * step}px`;
}

function hourText(hour) {
  const { timeFormat } = generalStore.tenant;
  let hourOut;
  if (timeFormat === 'HH:mm') {
    hourOut = hour < 10 ? `0${hour}` : hour;
  } else {
    hourOut = hour < 13 ? hour : hour - 12;
  }
  return `${hourOut}:00`;
}

function hourId(hour) {
  const hourOut = hour < 12 ? `0${hour}` : hour;
  return `at${hourOut}00`;
}

function minutesText(hour) {
  const { timeFormat } = generalStore.tenant;
  let hourOut;
  if (timeFormat === 'HH:mm') {
    hourOut = hour < 10 ? `0${hour}` : hour;
  } else {
    hourOut = hour < 13 ? hour : hour - 12;
  }
  const { trackerStep } = generalStore.tenant;
  if (trackerStep === 12) return `${hourOut}:12 ${hourOut}:24 ${hourOut}:36 ${hourOut}:48`;
  if (trackerStep === 15) return `${hourOut}:15 ${hourOut}:30 ${hourOut}:45`;
  if (trackerStep === 30) return `${hourOut}:30`;
  return `${hourOut}:06 ${hourOut}:12 ${hourOut}:18 ${hourOut}:24 ${hourOut}:30 ${hourOut}:36 ${hourOut}:42 ${hourOut}:48 ${hourOut}:54`;
}
</script>

<style scoped>
.ruler {
  position: absolute;
  top: 0;
  left: 0.2em;
  width: 2.3em;
  color: #1f1f1f;
  cursor: default;
  user-select: none;
}

.hour-holder {
  position: absolute;
  left: 0;
  right: 0;
}

.rmk {
  background-color: transparent;
  color: #ff0000;
}
</style>
