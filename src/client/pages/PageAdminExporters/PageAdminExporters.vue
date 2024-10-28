<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <h1>Exporters</h1>
    <div v-if="generalStore.settings.demoMode" class="main-pane">
      This page not available in demo environment.
    </div>
    <form v-else class="main-pane" @submit.prevent="saveExporters()">
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
    </form>
    <div v-if="loading" class="spinner spinner-global"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';

const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();

const loading = ref(false);
const exporters = ref([]);
const selectedIndex = ref(-1);

onMounted(() => {
  if (!generalStore.settings.demoMode) loadExporters();
});

async function loadExporters() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('loadExporters');
    exporters.value = res;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function saveExporters() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('saveExporters', exporters.value);
    exporters.value = res;
    notifierStore.addTemp({ type: 'success', txt: 'EXPORTERS SAVED' });
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function addExporter() {
  const newExporter = { name: '', url: '', apiKey: '' };
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
</style>
