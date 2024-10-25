<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div v-if="conStatus.status !== 'connected'" class="c-holder">
    <div
      :class="{
        'icon-connecting': conStatus.status === 'connecting',
        'icon-failed': conStatus.status === 'failed',
        'icon-waiting': conStatus.status === 'waiting',
        'icon-offline': conStatus.status === 'offline',
      }"
      class="icon-base"
    ></div>
    <div v-if="conStatus.status === 'connecting'" class="c-msg">
      Connecting to server...
    </div>
    <div v-else-if="conStatus.status === 'failed'" class="c-msg">
      Connection to server failed. Reason:
      {{ conStatus.reason }}
      To attempt to reconnect, press F5 (computer) or swipe down (mobile device).
    </div>
    <div v-else-if="conStatus.status === 'waiting'" class="c-msg">
      Connection to server closed. Waiting a few moments before automatically attempting to reconnect. To immediately attempt to reconnect, press F5 (computer) or swipe down (mobile device).
    </div>
    <div v-else-if="conStatus.status === 'offline'" class="c-msg">
      Connection to server closed. To attempt to reconnect, press F5 (computer) or swipe down (mobile device).
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

const conStatus = ref(undefined);

Tracker.autorun(() => {
  conStatus.value = Meteor.status();
});
</script>

<style scoped>
.c-holder {
  position: relative;
  height: 3em;
  width: 3em;
}

.icon-base {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 1.9em;
  height: 1.9em;
  margin: auto;
  background-repeat: no-repeat;
  background-size: auto 100%;
  background-position: center center;
  background-image: url('/icons/conicon-connecting.svg');
}

.icon-connecting {
  background-image: url('/icons/conicon-connecting.svg');
  animation: connection-spin 1000ms 0ms infinite forwards linear;
}

.icon-failed {
  background-image: url('/icons/conicon-failed.svg');
}

.icon-waiting {
  background-image: url('/icons/conicon-waiting.svg');
}

.icon-offline {
  background-image: url('/icons/conicon-offline.svg');
}

@keyframes connection-spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.c-msg {
  position: absolute;
  top: 4em;
  right: -0.4em;
  width: 20em;
  padding: 1em;
  text-align: center;
  background-color: #ffa500;
  color: #1f1f1f;
  text-align: justify;
  border-radius: 0.4em;
  box-shadow: 0.3em 0.3em 0em 0em rgba(0, 0, 0, 0.1);
}

.is-mobile .c-msg {
  position: fixed;
  top: 4em;
  left: 0;
  right: 0;
  width: 80%;
  margin: 0 auto;
  animation: mobile-appear 14000ms 0ms 1 forwards linear;
}

@keyframes mobile-appear {
  0% {
    transform: translateY(-40em);
  }

  96% {
    transform: translateY(-40em);
  }

  100% {
    transform: translateY(0);
  }
}
</style>
