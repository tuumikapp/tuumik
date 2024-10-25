<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div></div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

const generalStore = useGeneralStore();

// SUBSCRIPTION 1
let tracker1 = undefined;
let subscription1 = undefined;
const subscription1Ready = ref(false);

watch(() => generalStore.userId, (to, from) => {
  if (tracker1) tracker1.stop();
  if (subscription1) subscription1.stop();
  if (to) makeSubscription1();
}, { immediate: true });

function makeSubscription1() {
  tracker1 = Tracker.autorun(() => {
    subscription1 = Meteor.subscribe('usersSelf');
    subscription1Ready.value = subscription1.ready();
  });
}
// /SUBSCRIPTION 1

// LIVE QUERY 1
let tracker2 = undefined;
tracker2 = Tracker.autorun(() => {
  generalStore.user = Meteor.user();
});
// /LIVE QUERY 1

// METEOR CLEANUP
onUnmounted(() => {
  if (tracker1) tracker1.stop();
  if (subscription1) subscription1.stop();
  if (tracker2) tracker2.stop();
});
// /METEOR CLEANUP
</script>
