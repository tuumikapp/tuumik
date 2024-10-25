<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="icon-zoom" @click.self="showBox = true">
    <div v-if="showBox" class="zm-box">
      <div class="zm-dec" @click="generalStore.zoomBodyDec()"></div>
      <div class="zm-show">
        <div class="zm-value">{{ generalStore.zoomBody }}</div>
      </div>
      <div class="zm-inc" @click="generalStore.zoomBodyInc()"></div>
    </div>
    <div v-if="showBox" class="zm-close" @click="showBox = false"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';

const generalStore = useGeneralStore();
const showBox = ref(false);
</script>

<style scoped>
.icon-zoom {
  height: 3em;
  width: 3em;
  margin: 0 0.4em;
  background-repeat: no-repeat;
  background-size: auto 60%;
  background-position: center center;
  background-image: url('/icons/zoom.svg');
}

.is-mobile .icon-zoom {
  margin: 0 0.6em;
}

.zm-box {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: 90%;
  max-width: 36em;
  height: 9em;
  text-align: center;
  font-size: 16px;
  display: flex;
  box-shadow: 0.3em 0.3em 0em 0em rgba(0, 0, 0, 0.1);
  z-index: 1021;
}

.zm-show {
  width: 10em;
  border-right: 1px solid #9f9f9f;
  border-left: 1px solid #9f9f9f;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.zm-value {
  font-size: 1.6em;
  font-weight: 300;
}

.zm-name {
  font-size: 0.8em;
}

.zm-inc,
.zm-dec {
  width: 20em;
  background-color: #ffffff;
}

.zm-inc:hover,
.zm-dec:hover {
  background-color: #eeeeee;
  background-size: 1.5em;
}

.zm-inc {
  background-image: url('/icons/arrow-right.svg');
  background-repeat: no-repeat;
  background-size: 1em auto;
  background-position: center center;
}

.zm-dec {
  background-image: url('/icons/arrow-left.svg');
  background-repeat: no-repeat;
  background-size: 1em auto;
  background-position: center center;
}

.zm-close {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: black;
  opacity: 0.4;
  z-index: 1020;
}
</style>
