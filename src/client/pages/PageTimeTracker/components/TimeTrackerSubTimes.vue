<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <div v-if="!subscription1Ready" class="spinner spinner-global"></div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const props = defineProps({
  trackerDate: { type: Number, required: true },
});

// SUBSCRIPTION 1
let tracker1 = undefined;
let subscription1 = undefined;
const subscription1Ready = ref(false);

watch(() => props.trackerDate, (to, from) => {
  if (tracker1) tracker1.stop();
  if (subscription1) subscription1.stop();
  makeSubscription1();
}, { immediate: true });

function makeSubscription1() {
  tracker1 = Tracker.autorun(() => {
    const selDate = dayjs.utc(props.trackerDate).hour(0).minute(0).second(0).millisecond(1).toDate();
    subscription1 = Meteor.subscribe('timesOnDate', selDate);
    subscription1Ready.value = subscription1.ready();
  });
}
// /SUBSCRIPTION 1

// METEOR CLEANUP
onUnmounted(() => {
  if (tracker1) tracker1.stop();
  if (subscription1) subscription1.stop();
});
// /METEOR CLEANUP
</script>
