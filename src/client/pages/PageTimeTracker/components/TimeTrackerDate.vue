<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="date-box">
    <div class="sm-btn sm-tip-holder" @click="showPopup = true">
      <span v-if="!generalStore.isMobile" class="sel-weekday">{{ displayDate(trackerDate, true, 'dddd') }}</span
      >{{ displayDate(trackerDate) }}
      <span class="sm-tip">OPEN CALENDAR</span>
    </div>
    <div v-if="showPopup" class="popup-holder">
      <TimeTrackerRecent v-if="!generalStore.isMobile" :selected-date="trackerDate" />
      <DatePicker :source-date="trackerDate" :selected-date="trackerDate" @datepicker-pick="selectPickerDate($event)" />
    </div>
    <div v-if="showPopup" class="close-popup" @click="showPopup = false"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGeneralStore } from '/src/client/stores/general.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import TimeTrackerRecent from './TimeTrackerRecent.vue';
import DatePicker from '/src/client/components/DatePicker/DatePicker.vue';

dayjs.extend(utc);

const router = useRouter();
const generalStore = useGeneralStore();

const props = defineProps({
  trackerDate: { type: Number, required: true },
});

const showPopup = ref(false);

function displayDate(date, notUtc, customFormat) {
  const format = customFormat || generalStore.tenant.dateFormat;
  return !notUtc ? dayjs.utc(date).format(format) : dayjs(date).format(format);
}

function selectPickerDate(pickerDate) {
  const trackerDate = dayjs(pickerDate).format('YYYY-MM-DD');
  router.push({ name: 'timeTracker', params: { trackerDate } });
}
</script>

<style scoped>
.date-box {
  position: relative;
}

.sel-weekday {
  margin-right: 0.4em;
}

.popup-holder {
  position: absolute;
  top: 4em;
  left: 0;
  display: flex;
  align-items: flex-start;
  background-color: #f9f9f9;
  padding: 1em;
  border: 1px solid #cecece;
  border-radius: 0.2em;
  box-shadow: 0.3em 0.3em 0em 0em rgba(0, 0, 0, 0.1);
  z-index: 2;
}

.is-mobile .popup-holder {
  position: fixed;
  top: 8em;
  left: 0;
  right: 0;
  width: 23em;
  margin: 0 auto;
  padding: 0.2em;
}

.close-popup {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
