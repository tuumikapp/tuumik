<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="date-editor">
    <DatePicker :source-date="timeDate()" :selected-date="timeDate()" @datepicker-pick="selectPickerDate($event)" />
    <div v-if="loading" class="spinner spinner-global"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import DatePicker from '/src/client/components/DatePicker/DatePicker.vue';

dayjs.extend(utc);

const router = useRouter();
const notifierStore = useNotifierStore();

const props = defineProps({
  time: { type: Object, required: true },
});

const loading = ref(false);

function timeDate() {
  return props.time.date.getTime();
}

function selectPickerDate(pickerDate) {
  const selDate = dayjs.utc(pickerDate).hour(0).minute(0).second(0).millisecond(1).toDate();
  if (selDate.getTime() !== props.time.date.getTime()) setDate(selDate);
}

async function setDate(selDate) {
  loading.value = true;
  const timeId = props.time._id;
  try {
    await Meteor.callAsync('timeSetDate', timeId, selDate);
    loading.value = false;
    notifierStore.addTemp({ type: 'success', txt: 'MOVED TASK TO DIFFERENT DATE' });
    jumpToDate(selDate);
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function jumpToDate(selDate) {
  const trackerDate = dayjs(selDate).format('YYYY-MM-DD');
  router.push({ name: 'timeTracker', params: { trackerDate } });
}
</script>

<style scoped>
.date-editor {
  margin: 2em 0 0 0;
}
</style>
