<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <h1>General Settings</h1>
    <form class="main-pane" @submit.prevent="saveSettings1()">
      <div class="section-title">ORGANIZATION</div>
      <label for="name" class="field-label">NAME:</label>
      <input id="name" v-model="mainSettings.name" type="text" maxlength="500" />
      <label for="email" class="field-label">EMAIL:</label>
      <input id="email" v-model="mainSettings.email" type="text" maxlength="100" />
      <label for="phone" class="field-label">TELEPHONE:</label>
      <input id="phone" v-model="mainSettings.phone" type="text" maxlength="50" />
      <div class="field-tip">Must include country code.</div>
      <div class="section-title">CURRENCY</div>
      <label for="name" class="field-label">ACRONYM (EUR):</label>
      <input id="currency" v-model="mainSettings.currency.str" type="text" maxlength="9" />
      <label for="name" class="field-label">SYMBOL (€):</label>
      <input id="currency" v-model="mainSettings.currency.sign" type="text" maxlength="1" />
      <div class="section-title">FORMATS</div>
      <label for="date-format" class="field-label">DATE FORMAT:</label>
      <select id="date-format" v-model="mainSettings.dateFormat">
        <option value="DD.MM.YYYY">DD.MM.YYYY</option>
        <option value="MM.DD.YYYY">MM.DD.YYYY</option>
        <option value="YYYY.MM.DD">YYYY.MM.DD</option>
      </select>
      <label for="time-format" class="field-label">TIME FORMAT:</label>
      <select id="time-format" v-model="mainSettings.timeFormat">
        <option value="HH:mm">HH:mm (13:25)</option>
        <option value="h:mm A">h:mm A (1:25 PM)</option>
      </select>
      <label for="week-format" class="field-label">WEEK FORMAT:</label>
      <select id="week-format" v-model="mainSettings.weekStart">
        <option value="mon">Week starts on Monday</option>
        <option value="sun">Week starts on Sunday</option>
      </select>
      <label for="thou-mark" class="field-label">THOUSANDS SEPARATOR FOR SUMS:</label>
      <select id="thou-mark" v-model="mainSettings.thouMark">
        <option value="comma">Comma (123,456)</option>
        <option value="space">Space (123 456)</option>
      </select>
      <label for="decimal-mark" class="field-label">DECIMAL SEPARATOR FOR SUMS:</label>
      <select id="decimal-mark" v-model="mainSettings.decimalMark">
        <option value="period">Period (123.00)</option>
        <option value="comma">Comma (123,00)</option>
      </select>
      <div class="section-title">TIME TRACKER</div>
      <label class="field-label">USE TASK TYPES BY DEFAULT:</label>
      <label class="single-checkbox-label">
        <input v-model="mainSettings.useTaskTypesByDefault" type="checkbox" />
        <span>ENABLED</span>
      </label>
      <label for="tracker-step" class="field-label">TRACKER RESOLUTION:</label>
      <select id="tracker-step" v-model.number="mainSettings.trackerStep">
        <option value="1">1 minute</option>
        <option value="6">6 minutes</option>
        <option value="12">12 minutes</option>
        <option value="15">15 minutes</option>
        <option value="30">30 minutes</option>
      </select>
      <input type="submit" value="SAVE CHANGES" class="btn-submit" />
    </form>
    <div v-if="loading" class="spinner spinner-global"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import { isValidEmailAddress } from '/src/client/utils/validation';

const notifierStore = useNotifierStore();

const mainSettingsInit = {
  name: '',
  email: '',
  phone: '',
  currency: '',
  dateFormat: '',
  timeFormat: '',
  weekStart: '',
  thouMark: '',
  decimalMark: '',
  useTaskTypesByDefault: false,
  trackerStep: 1,
};
const mainSettings = ref(mainSettingsInit);
const loading = ref(false);

onMounted(() => {
  loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('mainSettingsLoad');
    mainSettings.value = res;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function saveSettings1() {
  if (!mainSettings.value.name) {
    notifierStore.addTemp({ type: 'error', txt: 'PLEASE FILL ALL REQUIRED FIELDS' });
  } else if (!isValidEmailAddress(mainSettings.value.email)) {
    notifierStore.addTemp({ type: 'error', txt: 'INVALID EMAIL ADDRESS' });
  } else {
    saveSettings2();
  }
}

async function saveSettings2() {
  loading.value = true;
  try {
    await Meteor.callAsync('mainSettingsSave', mainSettings.value);
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}
</script>
