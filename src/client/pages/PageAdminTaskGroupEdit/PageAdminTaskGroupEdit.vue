<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <div v-if="loading" class="spinner spinner-global"></div>
    <h1>Edit task group</h1>
    <form v-if="tg" class="main-pane" @submit.prevent="saveTaskGroup1()">
      <label for="g1" class="field-label">TASK GROUP NAME:</label>
      <input id="g1" v-model="tg.name" type="text" maxlength="40" />
      <label for="g2" class="field-label">POSITION:</label>
      <input id="g2" v-model.number="tg.position" type="number" step="1" />
      <label class="field-label">DEFAULT STATE:</label>
      <div>
        <div :class="{ 'sel-btn-on': tg.showByDefault }" class="btn sel-btn-off" @click="tg.showByDefault = tg.showByDefault ? false : true">SHOW BY DEFAULT</div>
      </div>
      <div class="section-title">TYPES</div>
      <div class="type-menu">
        <span class="btn" @click="addType()">ADD NEW</span>
        <span :class="{ 'sel-btn-on': selectedIndex > -1 }" class="btn sel-btn-off" @click="deleteType()">DELETE</span>
        <span :class="{ 'sel-btn-on': selectedIndex > 0 }" class="btn sel-btn-off" @click="moveTypeUp()">MOVE UP</span>
        <span :class="{ 'sel-btn-on': selectedIndex > -1 && selectedIndex < tg.types.length - 1 }" class="btn sel-btn-off" @click="moveTypeDown()">MOVE DOWN</span></div>
      <div v-for="(taskType, index) in tg.types" :key="index" :class="{ 'type-box-on': index === selectedIndex }" class="type-box">
        <input v-model="taskType.txt" type="text" maxlength="100" class="type-inp" />
        <div class="option-select" @click="selectedIndex = selectedIndex === index ? -1 : index"></div>
      </div>
      <input type="submit" value="SAVE CHANGES" class="btn-submit" />
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';

const route = useRoute();
const notifierStore = useNotifierStore();

const loading = ref(false);
const tg = ref(null);
const selectedIndex = ref(-1);

onMounted(() => {
  loadTaskGroup();
});

async function loadTaskGroup() {
  loading.value = true;
  const taskGroupId = route.params.taskGroupId;
  try {
    const res = await Meteor.callAsync('loadTaskGroupForEdit', taskGroupId);
    tg.value = res;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function saveTaskGroup1() {
  if (!tg.value.name) {
    notifierStore.addTemp({ type: 'error', txt: 'PLEASE FILL NAME FIELD' });
  } else {
    saveTaskGroup2();
  }
}

async function saveTaskGroup2() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('saveTaskGroup', tg.value);
    tg.value = res;
    notifierStore.addTemp({ type: 'success', txt: 'TASK GROUP SAVED' });
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function addType() {
  const newType = { txt: '' };
  if (tg.value.types.length < 100) tg.value.types.push(newType);
}

function deleteType() {
  if (selectedIndex.value > -1) {
    tg.value.types.splice(selectedIndex.value, 1);
    selectedIndex.value = -1;
  }
}

function moveTypeUp() {
  if (selectedIndex.value > 0) {
    const previous = tg.value.types[selectedIndex.value - 1];
    const selected = tg.value.types[selectedIndex.value];
    tg.value.types[selectedIndex.value - 1] = { ...selected };
    tg.value.types[selectedIndex.value] = { ...previous };
    selectedIndex.value -= 1;
  }
}

function moveTypeDown() {
  if (selectedIndex.value > -1 && selectedIndex.value < tg.value.types.length - 1) {
    const next = tg.value.types[selectedIndex.value + 1];
    const selected = tg.value.types[selectedIndex.value];
    tg.value.types[selectedIndex.value + 1] = { ...selected };
    tg.value.types[selectedIndex.value] = { ...next };
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

.type-menu {
  margin: 0.9em 0;
}

.sel-btn-off {
  opacity: 0.2;
}

.sel-btn-on {
  opacity: 1;
}

.type-box {
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type-box-on {
  outline: 2px solid #000000;
}

.type-box .type-inp {
  width: 80%;
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
