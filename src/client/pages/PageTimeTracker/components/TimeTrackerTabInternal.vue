<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <div class="row">
      <input :value="time.intCom" placeholder="INTERNAL COMMENT" type="text" maxlength="500" class="intcom" @blur="saveIntCom($event)" />
    </div>
    <div class="row">
      <label class="hide-history">HIDDEN<input v-model="hideHistoryVal" type="checkbox"/></label>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Meteor } from 'meteor/meteor';

const props = defineProps({
  time: { type: Object, required: true },
});

const hideHistoryVal = computed({
  get() {
    if (props.time.hideHistory) return true;
    return false;
  },
  set(newValue) {
    setHideHistory(newValue);
  },
});

async function setHideHistory(newValue) {
  const timeId = props.time._id;
  try {
    await Meteor.callAsync('timeHideHistory', timeId, newValue);
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
  }
}

async function saveIntCom(event) {
  const timeId = props.time._id;
  const intCom = event.target.value;
  if (intCom !== props.time.intCom) {
    try {
      await Meteor.callAsync('timeIntCom', timeId, intCom);
    } catch (err) {
      notifierStore.addTemp({ type: 'error', txt: err.reason });
    }
  }
}
</script>

<style scoped>
.row {
  padding: 0.8em 1em;
  border-bottom: 1px solid #d6d6d6;
}

.intcom {
  width: 30em;
}

.is-mobile .intcom {
  width: 100%;
}

.hide-history {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 10em;
  padding: 0.3em 0.5em;
  margin: 0;
  background-color: #ffffff;
  color: #919191;
  border: 1px solid #cecece;
  border-radius: 0.2em;
}
</style>
