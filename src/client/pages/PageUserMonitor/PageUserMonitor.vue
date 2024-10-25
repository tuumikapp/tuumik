<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <UserMonitorMain v-if="dateIsValid" :monitor-date="monitorDate" :date-str="dateStr" />
    <UserMonitorNoDate v-else />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import UserMonitorMain from './components/UserMonitorMain.vue';
import UserMonitorNoDate from './components/UserMonitorNoDate.vue';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

const route = useRoute();

const dateIsValid = ref(undefined);
const monitorDate = ref(undefined);
const dateStr = ref('');

watch(route, (to, from) => {
  const parsedDate = dayjs.utc(to.params.monitorDate, 'YYYY-MM-DD');
  if (parsedDate.isValid()) {
    monitorDate.value = parsedDate.valueOf();
    dateStr.value = to.params.monitorDate;
    dateIsValid.value = true;
  } else {
    monitorDate.value = undefined;
    dateIsValid.value = false;
    dateStr.value = '';
  }
}, { immediate: true });
</script>
