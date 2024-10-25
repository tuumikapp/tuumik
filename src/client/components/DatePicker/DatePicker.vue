<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="dp-holder">
    <div v-if="title" class="dp-title">{{ title }}</div>
    <form class="dp-toolbar" @submit.prevent="parseDate($event)">
      <input type="text" name="pDate" :value="displayDate(selectedDate)" placeholder="DD.MM.YYYY" autocomplete="off" class="dp-parse-input" />
      <input type="submit" value="SET" class="dp-parse-submit" />
    </form>
    <div class="dp-toolbar">
      <span class="dp-prev-month" @click="goPrevMonth()"></span>
      <select v-model="menuMonth" class="dp-month" @change="setMonth($event)">
        <option v-for="month in months" :key="month.val" :value="month.val">{{ month.name }}</option>
      </select>
      <select v-model="menuYear" class="dp-year" @change="setYear($event)">
        <option v-for="pickerYear in pickerYears" :key="pickerYear.val" :value="pickerYear.val">{{ pickerYear.val }}</option>
      </select>
      <span class="dp-next-month" @click="goNextMonth()"></span>
    </div>
    <ul class="dp-datelist">
      <li v-for="weekday in weekdays" :key="weekday.name" class="dp-weekday-title">
        {{ weekday.name }}
      </li>
      <li v-for="pickerDate in pickerDates" :key="pickerDate.ts" :class="pickerClasses(pickerDate)" class="dp-picker-date" @click="sendResult(pickerDate)">
        {{ pickerDate.dt.getDate() }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import isoWeek from 'dayjs/plugin/isoWeek';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(isoWeek);
dayjs.extend(customParseFormat);

const props = defineProps({
  sourceDate: { type: Number, required: true },
  selectedDate: { type: Number, required: false, default: undefined },
  title: { type: Number, required: false, default: undefined },
});

const emit = defineEmits(['datepicker-pick']);

const generalStore = useGeneralStore();
const srcDate = ref(new Date(props.sourceDate));

const months = [
  { name: 'January', val: 0 },
  { name: 'February', val: 1 },
  { name: 'March', val: 2 },
  { name: 'April', val: 3 },
  { name: 'May', val: 4 },
  { name: 'June', val: 5 },
  { name: 'July', val: 6 },
  { name: 'August', val: 7 },
  { name: 'September', val: 8 },
  { name: 'October', val: 9 },
  { name: 'November', val: 10 },
  { name: 'December', val: 11 },
];

const weekdaysForIsoWeek = [{ name: 'MON' }, { name: 'TUE' }, { name: 'WED' }, { name: 'THU' }, { name: 'FRI' }, { name: 'SAT' }, { name: 'SUN' }];
const weekdaysForWeek = [{ name: 'SUN' }, { name: 'MON' }, { name: 'TUE' }, { name: 'WED' }, { name: 'THU' }, { name: 'FRI' }, { name: 'SAT' }];
const weekdays = generalStore.tenant.weekStart === 'mon' ? weekdaysForIsoWeek : weekdaysForWeek;

const pickerDates = computed(() => {
  // 'isoWeek' and 'week' are strings from dayjs. 'isoWeek' means week start on MON, 'week' means week starts on SUN
  const weekStart = generalStore.tenant.weekStart === 'mon' ? 'isoWeek' : 'week';

  // count back to the first day of the week that holds the first day of the month
  // (this day is the first day that is displayed in the datepicker's 42 day grid)
  const startDate = dayjs.utc(srcDate.value).startOf('month').startOf(weekStart);

  let counterDate = dayjs.utc(startDate);

  // compose an array of 42 dates counting forward from the starting date determined above
  const dates = [];
  for (let i = 0; i < 42; i += 1) {
    const addDate = counterDate.toDate();
    const ts = counterDate.valueOf(); // using timestamp as a key for Vue's v-for
    const addDateObj = { dt: addDate, ts };
    dates.push(addDateObj);
    counterDate = dayjs.utc(counterDate).add(1, 'days');
  }
  return dates;
});

const pickerYears = computed(() => {
  const year = dayjs
    .utc(srcDate.value)
    .subtract(5, 'years')
    .year();
  const years = [];
  for (let i = 0; i < 9; i += 1) {
    years.push({ val: year + i });
  }
  return years;
});

const menuMonth = computed({
  get() {
    return dayjs.utc(srcDate.value).month();
  },
  set(newValue) {
    srcDate.value = dayjs.utc(srcDate.value).month(newValue);
  },
});

const menuYear = computed({
  get() {
    return dayjs.utc(srcDate.value).year();
  },
  set(newValue) {
    srcDate.value = dayjs.utc(srcDate.value).year(newValue);
  },
});

function displayDate(date, notUtc, customFormat) {
  const format = customFormat || generalStore.tenant.dateFormat;
  return !notUtc ? dayjs.utc(date).format(format) : dayjs(date).format(format);
}

function pickerClasses(pickerDate) {
  let classString = '';
  const pDate = dayjs.utc(pickerDate.dt);

  // highlight selected date
  const selectedDate = dayjs.utc(props.selectedDate);
  if (pDate.isSame(selectedDate, 'day')) {
    classString += ' dp-selected-date';
  }

  // highlight today
  const today = dayjs.utc();
  if (pDate.isSame(today, 'day')) {
    classString += ' dp-today';
  }

  // highlight dates that are outside of currently viewed month
  if (pDate.isSame(srcDate.value, 'month')) {
    classString += ' dp-current-month';
  } else {
    classString += ' dp-other-month';
  }

  return classString;
}

function goPrevMonth() {
  srcDate.value = dayjs.utc(srcDate.value).subtract(1, 'months').toDate();
}

function goNextMonth() {
  srcDate.value = dayjs.utc(srcDate.value).add(1, 'months').toDate();
}

function setMonth(event) {
  srcDate.value = dayjs.utc(srcDate.value).month(event.target.value).toDate();
}

function setYear(event) {
  srcDate.value = dayjs.utc(srcDate.value).year(event.target.value).toDate();
}

function parseDate(event) {
  const dateFormat = generalStore.tenant.dateFormat || 'DD.MM.YYYY';
  const parsedDate = dayjs.utc(event.target.pDate.value, dateFormat);
  if (parsedDate.isValid()) {
    srcDate.value = parsedDate.toDate();
    emit('datepicker-pick', parsedDate.toDate());
  }
}

function sendResult(pickerDate) {
  emit('datepicker-pick', pickerDate.dt);
}
</script>

<style scoped>
.dp-holder {
  background-color: #ffffff;
  border: 1px solid #cecece;
  border-radius: 0.3em;
  width: 23em;
  color: #1f1f1f;
  user-select: none;
}

.dp-datelist {
  width: 22.5em;
  list-style-type: none;
  padding: 0.5em 0;
  margin: 0 auto;
  text-align: center;
  color: #1f1f1f;
}

.dp-picker-date,
.dp-weekday-title {
  display: inline-block;
  width: 2.5em;
  padding: 0.2em 0;
  margin: 0.2em;
  box-sizing: border-box;
  border-radius: 0.2em;
  text-align: center;
}

.dp-picker-date {
  cursor: pointer;
}

.dp-current-month:hover {
  background-color: #d6d6d6;
}

.dp-other-month {
  opacity: 0.4;
}

.dp-other-month:hover {
  background-color: #d6d6d6;
  opacity: 1;
}

.dp-today {
  outline: #ffffff solid 0.1em;
}

.dp-selected-date {
  background-color: #00ab6a;
  color: #ffffff;
}

.dp-selected-date:hover {
  background-color: #02c97c;
}

.dp-weekday-title {
  color: #999999;
}

.dp-toolbar {
  display: flex;
  justify-content: space-between;
  margin: 0.5em 0;
  padding: 0 0.5em;
}

.dp-parse-input {
  width: 78%;
  text-align: center;
  padding: 0.7em 0;
  margin: 0.4em 0 0 0.5em;
}

.dp-parse-submit {
  width: 18%;
  padding: 0.7em 0;
  margin: 0.4em 0.5em 0 0.4em;
  background-color: #f9f9f9;
  border: 1px solid #cecece;
  border-radius: 0.2em;
}

.dp-parse-submit:hover {
  background-color: #ffffff;
}

.dp-prev-month {
  background-color: #f9f9f9;
  border: 1px solid #cecece;
  border-radius: 0.2em;
  width: 12%;
  margin: 0 0.2em 0 0.5em;
  height: 2.2em;
  box-shadow: none;
  background-image: url('/icons/arrow-left.svg');
  background-repeat: no-repeat;
  background-size: 60% auto;
  background-position: center center;
}

.dp-prev-month:hover {
  background-color: #ffffff;
  background-position: 30% center;
}

.dp-next-month {
  background-color: #f9f9f9;
  border: 1px solid #cecece;
  border-radius: 0.2em;
  width: 12%;
  margin: 0 0.5em 0 0.2em;
  height: 2.2em;
  box-shadow: none;
  background-image: url('/icons/arrow-right.svg');
  background-repeat: no-repeat;
  background-size: 60% auto;
  background-position: center center;
}

.dp-next-month:hover {
  background-color: #ffffff;
  background-position: 70% center;
}

.dp-month {
  padding: 0.4em;
  margin: 0 0.2em 0 0;
  width: 40%;
}

.dp-year {
  padding: 0.4em;
  margin: 0;
  width: 25%;
}

.dp-title {
  display: block;
  padding: 0.5em;
  background-color: #9f9f9f;
  text-align: center;
}
</style>
