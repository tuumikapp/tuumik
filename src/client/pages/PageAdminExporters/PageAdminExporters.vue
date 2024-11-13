<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <h1>Exporters</h1>
    <div v-if="generalStore.settings.demoMode" class="main-pane">
      This page not available in demo environment.
    </div>
    <form v-else class="main-pane" @submit.prevent="saveExporters()">
      In Timesheet Explorer you can select timesheet entries and send selected data to an export function (exporter) to process it.
      Exporters are primarily used to generate files, but can also provide other functionalities such as sending the data to another app via an API, sending emails etc.
      Exporters run outside of your Tuumik deployment. Any exporter you set up below will appear as a button in the export modal in Timesheet Explorer.
      <div class="top-menu">
        <span class="btn" @click="addExporter()">ADD NEW</span>
        <span :class="{ 'sel-btn-on': selectedIndex > -1 }" class="btn sel-btn-off" @click="deleteExporter()">DELETE</span>
        <span :class="{ 'sel-btn-on': selectedIndex > 0 }" class="btn sel-btn-off" @click="moveExporterUp()">MOVE UP</span>
        <span :class="{ 'sel-btn-on': selectedIndex > -1 && selectedIndex < exporters.length - 1 }" class="btn sel-btn-off" @click="moveExporterDown()">MOVE DOWN</span>
      </div>
      <div v-for="(exporter, index) in exporters" :key="index" :class="{ 'option-box-on': index === selectedIndex }" class="option-box">
        <input v-model="exporter.name" type="text" maxlength="30" placeholder="NAME" class="text-inp" />
        <input v-model="exporter.url" type="text" maxlength="500" placeholder="URL" class="text-inp" />
        <input v-model="exporter.apiKey" type="text" maxlength="100" placeholder="API KEY" class="text-inp" />
        <div class="option-select" @click="selectedIndex = selectedIndex === index ? -1 : index"></div>
      </div>
      <input type="submit" value="SAVE CHANGES" class="btn-submit" />
      <div class="public-exporter-divider"></div>
      <div v-if="loading2" class="spinner spinner-local"></div>
      <div v-if="publicExportersData?.exportersEnabled">
        <h2 class="top-h2">Free Exporters</h2>
        <div v-if="publicExportersData.textGeneral1" class="exporter-general-text">{{ publicExportersData.textGeneral1 }}</div>
        <div v-if="publicExportersData.textGeneral2" class="exporter-general-text">{{ publicExportersData.textGeneral2 }}</div>
        <div v-if="publicExportersData.textGeneral3" class="exporter-general-text">{{ publicExportersData.textGeneral3 }}</div>
        <div v-if="publicExportersData.textGeneral4" class="exporter-general-text">{{ publicExportersData.textGeneral4 }}</div>
        <div v-for="publicExporter in publicExportersData.exporters" :key="publicExporter.url" class="public-exporter-holder">
          <div class="public-exporter-name">{{ publicExporter.name }}</div>
          <div v-if="publicExporter.text1" class="public-exporter-text">{{ publicExporter.text1 }}</div>
          <div v-if="publicExporter.text2" class="public-exporter-text">{{ publicExporter.text2 }}</div>
          <div v-if="publicExporter.text3" class="public-exporter-text">{{ publicExporter.text3 }}</div>
          <div v-if="publicExporter.text4" class="public-exporter-text">{{ publicExporter.text4 }}</div>
          <div class="btn" @click="addPublicExporter(publicExporter)">ADD EXPORTER</div>
        </div>
      </div>
    </form>
    <div v-if="loading1" class="spinner spinner-global"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import { appVersion } from '/src/shared/utils/app.js';

const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();

const loading1 = ref(false);
const loading2 = ref(false);
const exporters = ref([]);
const selectedIndex = ref(-1);
const publicExportersData = ref(null);

onMounted(() => {
  if (!generalStore.settings.demoMode) loadExporters();
  if (!generalStore.settings.demoMode) loadPublicExportersData();
});

async function loadPublicExportersData() {
  loading2.value = true;
  const url = 'https://api.tuumik.com/v1/exporters/general';
  const body = { app: { version: appVersion } };
  const options = { method: 'POST', body: JSON.stringify(body), mode: 'cors' };
  try {
    const res = await fetch(url, options);
    publicExportersData.value = await res.json();
    loading2.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading2.value = false;
  }
}

async function loadExporters() {
  loading1.value = true;
  try {
    const res = await Meteor.callAsync('loadExporters');
    exporters.value = res;
    loading1.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading1.value = false;
  }
}

async function saveExporters() {
  loading1.value = true;
  try {
    const res = await Meteor.callAsync('saveExporters', exporters.value);
    exporters.value = res;
    notifierStore.addTemp({ type: 'success', txt: 'EXPORTERS SAVED' });
    loading1.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading1.value = false;
  }
}

function addExporter() {
  const newExporter = { name: '', url: '', apiKey: '' };
  if (exporters.value.length < 30) exporters.value.push(newExporter);
}

function addPublicExporter(publicExporter) {
  const newExporter = { name: publicExporter.name, url: publicExporter.url, apiKey: publicExporter.apiKey };
  if (exporters.value.length < 30) exporters.value.push(newExporter);
}

function deleteExporter() {
  if (selectedIndex.value > -1) {
    exporters.value.splice(selectedIndex.value, 1);
    selectedIndex.value = -1;
  }
}

function moveExporterUp() {
  if (selectedIndex.value > 0) {
    const previous = exporters.value[selectedIndex.value - 1];
    const selected = exporters.value[selectedIndex.value];
    exporters.value[selectedIndex.value - 1] = { ...selected };
    exporters.value[selectedIndex.value] = { ...previous };
    selectedIndex.value -= 1;
  }
}

function moveExporterDown() {
  if (selectedIndex.value > -1 && selectedIndex.value < exporters.value.length - 1) {
    const next = exporters.value[selectedIndex.value + 1];
    const selected = exporters.value[selectedIndex.value];
    exporters.value[selectedIndex.value + 1] = { ...selected };
    exporters.value[selectedIndex.value] = { ...next };
    selectedIndex.value += 1;
  }
}
</script>

<style scoped>
.section-title {
  border-bottom: 1px dashed #2d2d2d;
  margin: 4em 0 0 0;
  text-align: center;
}

.top-menu {
  margin: 0.9em 0;
}

.sel-btn-off {
  opacity: 0.2;
}

.sel-btn-on {
  opacity: 1;
}

.option-box {
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.option-box-on {
  outline: 2px solid #000000;
}

.option-box .text-inp {
  width: 30%;
}

.option-select {
  height: 2.25em;
  width: 19.5%;
  background-color: #e7e7e7;
  border: 1px solid #cccccc;
  border-radius: 0.2em;
  background-image: url('/icons/arrow-left.svg');
  background-repeat: no-repeat;
  background-size: auto 40%;
  background-position: 90% 50%;
}

.option-select:hover {
  background-color: #ececec;
}

.public-exporter-divider {
  margin: 3em 0 0 0;
}

.spinner-local {
  width: 2em;
  height: 2em;
}

.exporter-general-text {
  margin: 0 0 1em 0;
}

.public-exporter-holder {
  padding: 1em;
  margin: 1em 0 0 0;
  border: 1px solid #cccccc;
  border-radius: 0.2em;
}

.public-exporter-text {
  margin: 0.5em 0;
}

.public-exporter-name {
  font-weight: 600;
}
</style>
