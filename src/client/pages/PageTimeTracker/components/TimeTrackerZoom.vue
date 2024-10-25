<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="zoom-box">
    <div class="sm-btn zoom-btn" @click="showPopup = true"></div>
    <div v-if="showPopup" class="popup-holder">
      <div class="zm-row">
        <div class="zoom-dec" @click="trackerStore.decreaseZoomMain()"></div>
        <div class="zm-show">
          <div class="zm-value">{{ trackerStore.zoomMain }}</div>
          <div class="zm-name">FONT SIZE</div>
        </div>
        <div class="zoom-inc" @click="trackerStore.increaseZoomMain()"></div>
      </div>
      <div class="zm-row">
        <div class="ppm-dec" @click="changePPM('dec')"></div>
        <div class="zm-show">
          <div class="zm-value">
            {{ trackerStore.pixelsPerMinute }}
          </div>
          <div class="zm-name">PIXELS PER MINUTE</div>
        </div>
        <div class="ppm-inc" @click="changePPM('inc')"></div>
      </div>
    </div>
    <div v-if="showPopup" class="close-popup" @click="showPopup = false"></div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { useTrackerStore } from '/src/client/stores/tracker.js';

const trackerStore = useTrackerStore();

const showPopup = ref(false);

async function changePPM(change) {
  // determine scroll position before PPM change
  const full = document.getElementById('time-tracker-base').getBoundingClientRect().height;
  const partial = window.scrollY;
  const halfScreenRatio = window.innerHeight / 2 / full;
  const scrollRatio = partial / full + halfScreenRatio;

  // change PPM
  if (change === 'dec') {
    trackerStore.decreasePixelsPerMinute();
  } else {
    trackerStore.increasePixelsPerMinute();
  }

  // after DOM update restore scroll position so that the center of the screen stays in place
  await nextTick();
  const fullNew = document.getElementById('time-tracker-base').getBoundingClientRect().height;
  const partialNew = scrollRatio * fullNew;
  if (document.scrollingElement) document.scrollingElement.scrollTop = partialNew - window.innerHeight / 2;
}
</script>

<style scoped>
.zoom-box {
  position: relative;
}

.zoom-btn {
  width: 2.5em;
  background-image: url('/icons/zoom.svg');
  background-repeat: no-repeat;
  background-size: auto 70%;
  background-position: center center;
}

.is-mobile .zoom-btn {
  width: 0.7em;
}

.popup-holder {
  position: absolute;
  top: 4em;
  right: 0;
  background-color: #ffffff;
  border: 1px solid #cecece;
  padding: 1em;
  border-radius: 0.2em;
  box-shadow: 0.3em 0.3em 0em 0em rgba(0, 0, 0, 0.1);
  z-index: 2;
}

.zm-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.zm-show {
  width: 6em;
  height: 4em;
  border-right: 1px solid #cecece;
  border-left: 1px solid #cecece;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.zm-value {
  font-size: 1.6em;
  text-align: center;
}

.zm-show:hover .zm-value {
  display: none;
}

.zm-name {
  font-size: 0.8em;
  display: none;
  text-align: center;
}

.zm-show:hover .zm-name {
  display: block;
}

.zoom-inc,
.zoom-dec,
.ppm-inc,
.ppm-dec {
  width: 6em;
  height: 4em;
  background-color: #f9f9f9;
}

.zoom-inc:hover,
.zoom-dec:hover,
.ppm-inc:hover,
.ppm-dec:hover {
  background-color: #ffffff;
  background-size: 1.5em;
}

.zoom-inc,
.ppm-inc {
  background-image: url('/icons/arrow-right.svg');
  background-repeat: no-repeat;
  background-size: 1em auto;
  background-position: center center;
}

.zoom-dec,
.ppm-dec {
  background-image: url('/icons/arrow-left.svg');
  background-repeat: no-repeat;
  background-size: 1em auto;
  background-position: center center;
}

.close-popup {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
