<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="recent-list">
    <div v-for="recentDate in recentDates" :key="recentDate.ts" :class="pickerClasses(recentDate)" class="recent-date" @click="pickDate(recentDate.dt)">
      {{ displayDate(recentDate.dt) }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useGeneralStore } from '/src/client/stores/general.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const router = useRouter();
const route = useRoute();
const generalStore = useGeneralStore();

const props = defineProps({
  selectedDate: { type: Number, required: true },
});

const recentDates = computed(() => {
  const srcDate = dayjs().subtract(9, 'days');
  let counterDate = dayjs.utc(srcDate);

  // compose an array of 10 dates counting forward from the starting date determined above
  const dates = [];
  for (let i = 0; i < 10; i += 1) {
    const dt = counterDate.toDate();
    const ts = counterDate.valueOf(); // using timestamp as a key for Vue's v-for above
    const addDateObj = { dt, ts };
    dates.push(addDateObj);
    counterDate = dayjs.utc(counterDate).add(1, 'days');
  }
  return dates;
});

function pickDate(recentDate) {
  const trackerDate = dayjs(recentDate).format('YYYY-MM-DD');
  if (route.params.trackerDate !== trackerDate) router.push({ name: 'timeTracker', params: { trackerDate } });
}

function pickerClasses(recentDate) {
  let classString = '';
  const pDate = dayjs(recentDate.dt);

  // highlight selected date
  const selDate = dayjs(props.selectedDate);
  if (pDate.isSame(selDate, 'day')) classString += ' dp-selected-date';

  return classString;
}

function displayDate(date, notUtc, customFormat) {
  const format = customFormat || generalStore.tenant.dateFormat;
  return !notUtc ? dayjs.utc(date).format(format) : dayjs(date).format(format);
}
</script>

<style scoped>
.recent-list {
  width: 7em;
  margin: 0 1em 0 0;
  border: 1px solid #cecece;
  border-radius: 0.3em;
  user-select: none;
}

.recent-date {
  background-color: #f9f9f9;
  padding: 0.48em 1em;
  cursor: pointer;
}

.recent-date:hover {
  background-color: #ffffff;
}

.dp-selected-date {
  background-color: #00ab6a;
  color: #ffffff;
}

.dp-selected-date:hover {
  background-color: #02c97c;
}
</style>
