<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <TimeTrackerSubTimes v-if="dateIsValid" :tracker-date="trackerDate" />
    <TimeTrackerBaseVisual v-if="dateIsValid && trackerStore.viewMode === 'visual'" :tracker-date="trackerDate" />
    <TimeTrackerBaseText v-else-if="dateIsValid && trackerStore.viewMode === 'text'" :tracker-date="trackerDate" />
    <TimeTrackerNoDate v-else />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useTrackerStore } from '/src/client/stores/tracker.js';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import TimeTrackerSubTimes from './components/TimeTrackerSubTimes.vue';
import TimeTrackerBaseVisual from './components/TimeTrackerBaseVisual.vue';
import TimeTrackerBaseText from './components/TimeTrackerBaseText.vue';
import TimeTrackerNoDate from './components/TimeTrackerNoDate.vue';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

const trackerStore = useTrackerStore();
const route = useRoute();

const dateIsValid = ref(undefined);
const trackerDate = ref(undefined);

watch(route, (to, from) => {
  const parsedDate = dayjs.utc(to.params.trackerDate, 'YYYY-MM-DD');
  if (parsedDate.isValid()) {
    trackerDate.value = parsedDate.valueOf();
    dateIsValid.value = true;
  } else {
    trackerDate.value = undefined;
    dateIsValid.value = false;
  }
}, { immediate: true });
</script>
