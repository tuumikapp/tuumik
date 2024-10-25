<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <div v-if="loading" class="spinner spinner-global"></div>
    <h1>In/Out Options</h1>
    <form v-if="!loading || inOutOptions.length" class="main-pane" @submit.prevent="saveInOutOptions()">
      <div class="top-menu">
        <span class="btn" @click="addOption()">ADD NEW</span>
        <span :class="{ 'sel-btn-on': selectedIndex > -1 }" class="btn sel-btn-off" @click="deleteOption()">DELETE</span>
        <span :class="{ 'sel-btn-on': selectedIndex > 0 }" class="btn sel-btn-off" @click="moveOptionUp()">MOVE UP</span>
        <span :class="{ 'sel-btn-on': selectedIndex > -1 && selectedIndex < inOutOptions.length - 1 }" class="btn sel-btn-off" @click="moveOptionDown()">MOVE DOWN</span></div>
      <div v-for="(inOutOption, index) in inOutOptions" :key="index" :class="{ 'option-box-on': index === selectedIndex }" class="option-box">
        <input v-model="inOutOption.text" type="text" maxlength="30" class="text-inp" />
        <label class="single-checkbox-label work-box">
          <span>WORK</span>
          <input v-model="inOutOption.work" type="checkbox" />
        </label>
        <input v-model="inOutOption.colorBG" type="color" class="color-bg-inp" />
        <input v-model="inOutOption.colorTxt" type="color" class="color-txt-inp" />
        <div class="option-select" @click="selectedIndex = selectedIndex === index ? -1 : index"></div>
      </div>
      <input type="submit" value="SAVE CHANGES" class="btn-submit" />
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';

const notifierStore = useNotifierStore();

const loading = ref(false);
const inOutOptions = ref([]);
const selectedIndex = ref(-1);

onMounted(() => {
  loadInOutOptions();
});

async function loadInOutOptions() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('loadInOutOptions');
    inOutOptions.value = res;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function saveInOutOptions() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('saveInOutOptions', inOutOptions.value);
    inOutOptions.value = res;
    notifierStore.addTemp({ type: 'success', txt: 'IN/OUT OPTIONS SAVED' });
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function addOption() {
  const newOption = { text: '', colorBG: '#32cd32', colorTxt: '#000000' };
  if (inOutOptions.value.length < 30) inOutOptions.value.push(newOption);
}

function deleteOption() {
  if (selectedIndex.value > -1) {
    inOutOptions.value.splice(selectedIndex.value, 1);
    selectedIndex.value = -1;
  }
}

function moveOptionUp() {
  if (selectedIndex.value > 0) {
    const previous = inOutOptions.value[selectedIndex.value - 1];
    const selected = inOutOptions.value[selectedIndex.value];
    inOutOptions.value[selectedIndex.value - 1] = { ...selected };
    inOutOptions.value[selectedIndex.value] = { ...previous };
    selectedIndex.value -= 1;
  }
}

function moveOptionDown() {
  if (selectedIndex.value > -1 && selectedIndex.value < inOutOptions.value.length - 1) {
    const next = inOutOptions.value[selectedIndex.value + 1];
    const selected = inOutOptions.value[selectedIndex.value];
    inOutOptions.value[selectedIndex.value + 1] = { ...selected };
    inOutOptions.value[selectedIndex.value] = { ...next };
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
  width: 50%;
}

.work-box {
  width: 9%;
  padding: 0.3em 0.5em;
}

.option-box .color-bg-inp,
.option-box .color-txt-inp {
  width: 9.5%;
  height: 2.2em;
  padding: 0;
}

.option-select {
  height: 2.3em;
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
