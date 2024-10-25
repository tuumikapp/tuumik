import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useTrackerStore = defineStore('tracker', () => {
  const viewMode = ref(localStorage.viewMode || 'visual');
  const pixelsPerMinute = ref(localStorage.pixelsPerMinute ? Number.parseInt(localStorage.pixelsPerMinute, 10) : 4);
  const zoomMain = ref(localStorage.zoomMain ? Number.parseFloat(localStorage.zoomMain) : 1);
  const resizeInProgressTop = ref(null);
  const resizeInProgressBottom = ref(null);
  const copyInProgress = ref(null);
  const moveInProgress = ref(null);

  function setViewMode(value) {
    viewMode.value = value;
    localStorage.viewMode = value;
  }

  function increasePixelsPerMinute() {
    if (pixelsPerMinute.value < 14) {
      const newValue = pixelsPerMinute.value + 1;
      pixelsPerMinute.value = newValue;
      localStorage.pixelsPerMinute = newValue;
    }
  }

  function decreasePixelsPerMinute() {
    if (pixelsPerMinute.value > 2) {
      const newValue = pixelsPerMinute.value - 1;
      pixelsPerMinute.value = newValue;
      localStorage.pixelsPerMinute = newValue;
    }
  }

  function increaseZoomMain() {
    if (zoomMain.value < 4) {
      const newValue = Math.round(zoomMain.value * 10 + 1) / 10;
      zoomMain.value = newValue;
      localStorage.zoomMain = newValue;
    }
  }

  function decreaseZoomMain() {
    if (zoomMain.value > 0.2) {
      const newValue = Math.round(zoomMain.value * 10 - 1) / 10;
      zoomMain.value = newValue;
      localStorage.zoomMain = newValue;
    }
  }

  function initResizeInProgressTop(value) {
    resizeInProgressBottom.value = null;
    resizeInProgressTop.value = value;
  }

  function initResizeInProgressBottom(value) {
    resizeInProgressTop.value = null;
    resizeInProgressBottom.value = value;
  }

  return {
    viewMode,
    pixelsPerMinute,
    zoomMain,
    resizeInProgressTop,
    resizeInProgressBottom,
    copyInProgress,
    moveInProgress,
    setViewMode,
    increasePixelsPerMinute,
    decreasePixelsPerMinute,
    increaseZoomMain,
    decreaseZoomMain,
    initResizeInProgressTop,
    initResizeInProgressBottom
  };
});
