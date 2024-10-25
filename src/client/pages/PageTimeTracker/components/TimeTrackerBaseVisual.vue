<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div
    id="time-tracker-base"
    :style="{
      height: baseHeight,
      backgroundImage: baseBackground.image,
      backgroundSize: baseBackground.size,
      cursor: baseCursor,
    }"
    @dblclick.self="timeInsertFromBase($event)"
    @mousemove="mousemove($event)"
    @mouseup="mouseup()"
    @mousedown.self.prevent
  >
    <TimeTrackerMenu :tracker-date="trackerDate" :times="times" />
    <div v-if="!inserting && !openId" class="circle-btn" @click="timeInsertCircle()">
      <span class="c-tip c-tip-rev">INSERT TIME</span>
    </div>
    <div v-else-if="!openId" class="circle-btn circle-btn-inserting"></div>
    <div v-if="!openId" class="circle-btn circle-btn-mode" @click="trackerStore.viewMode = 'text'">
      <span class="c-tip">LIST VIEW</span>
    </div>
    <div v-if="!openId" class="circle-btn circle-btn-prev" @click="datePrev()">
      <span class="c-tip">PREVIOUS DATE</span>
    </div>
    <div v-if="!openId" class="circle-btn circle-btn-next" @click="dateNext()">
      <span class="c-tip">NEXT DATE</span>
    </div>
    <TimeTrackerRuler />
    <TimeTrackerBox v-for="time in times" :key="time._id" :tracker-date="trackerDate" :time="time" :task-groups="taskGroups" :open-id="openId" @set-open-id="openId = $event" />
    <div v-if="trackerStore.resizeInProgressTop || trackerStore.resizeInProgressBottom" :style="{ top: resizeBoxTop, bottom: resizeBoxBottom }" class="resize-box">
      <div class="resize-start">{{ resizeDisplayStart }}</div>
      <div class="resize-end">{{ resizeDisplayEnd }}</div>
      <div class="resize-duration">{{ resizeDisplayDuration }}</div>
    </div>
    <div
      v-if="trackerStore.copyInProgress"
      :style="{ top: copyBoxTop, bottom: copyBoxBottom }"
      :class="{ 'copy-box-conflict': copyBoxConflictCheck.conflict }"
      class="copy-box"
    ></div>
    <div
      v-if="trackerStore.moveInProgress"
      :style="{ top: moveBoxTop, bottom: moveBoxBottom }"
      :class="{ 'move-box-conflict': moveBoxConflictCheck.conflict }"
      class="move-box"
    ></div>
    <div v-if="loading" class="spinner spinner-global"></div>
    <div v-if="inserting" class="spinner spinner-global"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { useTrackerStore } from '/src/client/stores/tracker.js';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import TimeTrackerMenu from './TimeTrackerMenu.vue';
import TimeTrackerRuler from './TimeTrackerRuler.vue';
import TimeTrackerBox from './TimeTrackerBox.vue';
import { Times } from '/src/shared/collections/collections.js';
import { minutesToDuration } from '/src/shared/utils/time.js';

dayjs.extend(utc);

const router = useRouter();
const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();
const trackerStore = useTrackerStore();

const props = defineProps({
  trackerDate: { type: Number, required: true },
});

const loading = ref(false);
const inserting = ref(false);
const times = ref([]);
const taskGroups = ref([]);
const openId = ref('');
const resizeBoxTop = ref(null);
const resizeBoxTopLimitUpward = ref(null);
const resizeBoxTopLimitDownward = ref(null);
const resizeBoxTopMinute = ref(null);
const resizeBoxBottom = ref(null);
const resizeBoxBottomLimitUpward = ref(null);
const resizeBoxBottomLimitDownward = ref(null);
const resizeBoxBottomMinute = ref(null);
const copyBoxTop = ref(null);
const copyBoxBottom = ref(null);
const copyBoxConflictCheck = ref(null);
const moveBoxTop = ref(null);
const moveBoxBottom = ref(null);
const moveBoxConflictCheck = ref(null);

const baseHeight = computed(() => {
  return `${trackerStore.pixelsPerMinute * 1440}px`;
});

const baseBackground = computed(() => {
  const { trackerStep } = generalStore.tenant;
  const step = trackerStep === 1 ? 6 : trackerStep;
  const gridStep = trackerStore.pixelsPerMinute * step;
  const image = `linear-gradient(to bottom, #ffffff, #ffffff ${gridStep - 1}px, #f0f0f0 ${gridStep - 1}px, #f0f0f0 ${gridStep}px)`;
  const size = `auto ${gridStep}px`;
  return { image, size };
});

const baseCursor = computed(() => {
  if (trackerStore.resizeInProgressTop || trackerStore.resizeInProgressBottom) {
    return 'ns-resize';
  }
  if (trackerStore.copyInProgress) {
    return 'cell';
  }
  if (trackerStore.moveInProgress) {
    return 'all-scroll';
  }
  return 'default';
});

const resizeDisplayStart = computed(() => {
  let minutes = 0;
  if (trackerStore.resizeInProgressTop) {
    minutes = resizeBoxTopMinute.value;
  } else {
    minutes = trackerStore.resizeInProgressBottom.startMinute;
  }
  const timeFormat = generalStore.tenant.timeFormat || 'HH:mm';
  return dayjs().hour(0).minute(minutes).format(timeFormat);
});

const resizeDisplayEnd = computed(() => {
  let minutes = 0;
  if (trackerStore.resizeInProgressTop) {
    minutes = trackerStore.resizeInProgressTop.endMinute;
  } else {
    minutes = resizeBoxBottomMinute.value;
  }
  const timeFormat = generalStore.tenant.timeFormat || 'HH:mm';
  return dayjs().hour(0).minute(minutes).format(timeFormat);
});

const resizeDisplayDuration = computed(() => {
  let minutes = 0;
  if (trackerStore.resizeInProgressTop) {
    minutes = trackerStore.resizeInProgressTop.endMinute - resizeBoxTopMinute.value;
  } else {
    minutes = resizeBoxBottomMinute.value - trackerStore.resizeInProgressBottom.startMinute;
  }
  return minutesToDuration(minutes);
});

const triggerResizeTop = computed(() => {
  return trackerStore.resizeInProgressTop;
});

const triggerResizeBottom = computed(() => {
  return trackerStore.resizeInProgressBottom;
});

const triggerCopy = computed(() => {
  return trackerStore.copyInProgress;
});

const triggerMove = computed(() => {
  return trackerStore.moveInProgress;
});

watch(triggerResizeTop, (to, from) => {
  if (to) prepareResizeTop();
});

watch(triggerResizeBottom, (to, from) => {
  if (to) prepareResizeBottom();
});

watch(triggerCopy, (to, from) => {
  if (to) prepareCopy();
});

watch(triggerMove, (to, from) => {
  if (to) prepareMove();
});

onMounted(() => {
  loadTaskGroups();
});

async function loadTaskGroups() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('getTaskGroups');
    taskGroups.value = res;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function timeInsertFromBase(event) {
  const selDate = dayjs.utc(props.trackerDate).hour(0).minute(0).second(0).millisecond(1).toDate();

  // get mouse position relative to the time-tracker-base element
  const trackerBase = document.getElementById('time-tracker-base');
  let posY = event.pageY - trackerBase.offsetTop;
  if (generalStore.tenant.trackerStep !== 1) posY = snapPosYToStep(posY, true);
  const startMinute = Math.floor(posY / trackerStore.pixelsPerMinute);
  try {
    await Meteor.callAsync('timeInsert', selDate, startMinute);
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
  }
}

async function timeInsertCircle() {
  inserting.value = true;
  const selDate = dayjs.utc(props.trackerDate).hour(0).minute(0).second(0).millisecond(1).toDate();

  const now = new Date();
  const startMinute = now.getHours() * 60 + now.getMinutes();
  try {
    const res = await Meteor.callAsync('timeInsert', selDate, startMinute);
    openId.value = res.timeId;
    inserting.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    inserting.value = false;
  }
}

function datePrev() {
  const trackerDate = dayjs(props.trackerDate).subtract(1, 'days').format('YYYY-MM-DD');
  router.push({ name: 'timeTracker', params: { trackerDate } });
}

function dateNext() {
  const trackerDate = dayjs(props.trackerDate).add(1, 'days').format('YYYY-MM-DD');
  router.push({ name: 'timeTracker', params: { trackerDate } });
}

function mousemove(event) {
  if (trackerStore.resizeInProgressTop) {
    const trackerBase = document.getElementById('time-tracker-base');
    let posY = event.pageY - trackerBase.offsetTop;
    if (generalStore.tenant.trackerStep !== 1) posY = snapPosYToStep(posY);
    if (posY >= resizeBoxTopLimitUpward.value * trackerStore.pixelsPerMinute && posY <= resizeBoxTopLimitDownward.value * trackerStore.pixelsPerMinute) {
      resizeBoxTop.value = `${posY}px`;
      resizeBoxTopMinute.value = Math.ceil(posY / trackerStore.pixelsPerMinute) - 1;
    } else if (posY < resizeBoxTopLimitUpward.value * trackerStore.pixelsPerMinute) {
      resizeBoxTop.value = `${resizeBoxTopLimitUpward.value * trackerStore.pixelsPerMinute}px`;
      resizeBoxTopMinute.value = resizeBoxTopLimitUpward.value;
    } else {
      resizeBoxTop.value = `${resizeBoxTopLimitDownward.value * trackerStore.pixelsPerMinute}px`;
      resizeBoxTopMinute.value = resizeBoxTopLimitDownward.value;
    }
  } else if (trackerStore.resizeInProgressBottom) {
    const trackerBase = document.getElementById('time-tracker-base');
    let posY = event.pageY - trackerBase.offsetTop;
    if (generalStore.tenant.trackerStep !== 1) posY = snapPosYToStep(posY);
    resizeBoxBottomMinute.value = Math.ceil(posY / trackerStore.pixelsPerMinute);
    if (
      posY >= resizeBoxBottomLimitUpward.value * trackerStore.pixelsPerMinute &&
      posY <= resizeBoxBottomLimitDownward.value * trackerStore.pixelsPerMinute
    ) {
      resizeBoxBottom.value = `${1440 * trackerStore.pixelsPerMinute - posY}px`;
    } else if (posY < resizeBoxBottomLimitUpward.value * trackerStore.pixelsPerMinute) {
      resizeBoxBottom.value = `${1440 * trackerStore.pixelsPerMinute - resizeBoxBottomLimitUpward.value * trackerStore.pixelsPerMinute}px`;
      resizeBoxBottomMinute.value = resizeBoxBottomLimitUpward.value;
    } else {
      resizeBoxBottom.value = `${1440 * trackerStore.pixelsPerMinute - (resizeBoxBottomLimitDownward.value * trackerStore.pixelsPerMinute - 1)}px`;
      resizeBoxBottomMinute.value = resizeBoxBottomLimitDownward.value;
    }
  } else if (trackerStore.copyInProgress) {
    const trackerBase = document.getElementById('time-tracker-base');
    let posY = event.pageY - trackerBase.offsetTop;
    if (generalStore.tenant.trackerStep !== 1) posY = snapPosYToStep(posY, true);
    const { trackerStep } = generalStore.tenant;
    const lengthInMinutes = trackerStep !== 1 && trackerStep !== 6 ? trackerStep : 6;
    copyBoxTop.value = `${posY}px`;
    const bottom = (1440 - lengthInMinutes) * trackerStore.pixelsPerMinute - posY;
    if (bottom < 1440 * trackerStore.pixelsPerMinute) {
      copyBoxBottom.value = `${bottom}px`;
    } else {
      // here the copying takes place on the last minutes of the day and so we cannot use the 'top + lenghtInMinutes' approach
      copyBoxBottom.value = `${1440 * trackerStore.pixelsPerMinute}px`;
    }

    // collision detection
    const posInMinutes = Math.floor(posY / trackerStore.pixelsPerMinute);
    let positionConflict = false;
    for (let i = 0; i < times.value.length; i += 1) {
      if (
        (times.value[i].startMinute >= posInMinutes && times.value[i].startMinute <= posInMinutes + lengthInMinutes) ||
        (times.value[i].endMinute > posInMinutes && times.value[i].endMinute < posInMinutes + lengthInMinutes) ||
        (times.value[i].startMinute < posInMinutes && times.value[i].endMinute > posInMinutes) ||
        (times.value[i].startMinute <= posInMinutes + lengthInMinutes && times.value[i].endMinute >= posInMinutes + lengthInMinutes)
      ) {
        positionConflict = true;
        break;
      }
    }
    copyBoxConflictCheck.value = {
      conflict: positionConflict,
      startMinute: posInMinutes,
    };
    // /collision detection
  } else if (trackerStore.moveInProgress) {
    const trackerBase = document.getElementById('time-tracker-base');
    let posY = event.pageY - trackerBase.offsetTop;
    if (generalStore.tenant.trackerStep !== 1) posY = snapPosYToStep(posY, true);
    const timeBeingMoved = trackerStore.moveInProgress;
    const heightInMinutes = timeBeingMoved.endMinute - timeBeingMoved.startMinute;
    let posInMinutes = Math.floor(posY / trackerStore.pixelsPerMinute);
    const bottomInMinutes = posInMinutes + heightInMinutes;
    if (bottomInMinutes <= 1440) {
      moveBoxTop.value = `${posY}px`;
      const bottom = (1440 - heightInMinutes) * trackerStore.pixelsPerMinute - posY;
      moveBoxBottom.value = `${bottom}px`;
    } else {
      // here the the bottom end has reached the end of day, so top and bottom positions should not move down further
      moveBoxTop.value = `${(1440 - heightInMinutes) * trackerStore.pixelsPerMinute}px`;
      moveBoxBottom.value = `${0}px`;
      posInMinutes = 1440 - heightInMinutes;
    }

    // collision detection
    let positionConflict = false;
    for (let i = 0; i < times.value.length; i += 1) {
      if (
        !(times.value[i]._id === timeBeingMoved._id) &&
        ((times.value[i].startMinute >= posInMinutes && times.value[i].startMinute <= posInMinutes + heightInMinutes) ||
          (times.value[i].endMinute > posInMinutes && times.value[i].endMinute < posInMinutes + heightInMinutes) ||
          (times.value[i].startMinute < posInMinutes && times.value[i].endMinute > posInMinutes) ||
          (times.value[i].startMinute <= posInMinutes + heightInMinutes && times.value[i].endMinute >= posInMinutes + heightInMinutes))
      ) {
        positionConflict = true;
        break;
      }
    }
    moveBoxConflictCheck.value = {
      conflict: positionConflict,
      startMinute: posInMinutes,
    };
    // /collision detection
  }
}

async function mouseup() {
  if (trackerStore.resizeInProgressTop) {
    const timeId = trackerStore.resizeInProgressTop._id;
    const startMinute = resizeBoxTopMinute.value;
    trackerStore.initResizeInProgressTop(false);
    try {
      await Meteor.callAsync('timeResizeTop', timeId, startMinute);
    } catch (err) {
      notifierStore.addTemp({ type: 'error', txt: err.reason });
    }
  } else if (trackerStore.resizeInProgressBottom) {
    const timeId = trackerStore.resizeInProgressBottom._id;
    const endMinute = resizeBoxBottomMinute.value;
    trackerStore.initResizeInProgressBottom(false);
    try {
      await Meteor.callAsync('timeResizeBottom', timeId, endMinute);
    } catch (err) {
      notifierStore.addTemp({ type: 'error', txt: err.reason });
    }
  } else if (trackerStore.copyInProgress) {
    const sourceTimeId = trackerStore.copyInProgress._id;
    const { startMinute } = copyBoxConflictCheck.value;
    trackerStore.copyInProgress = null;
    try {
      await Meteor.callAsync('timeInsertCopy', sourceTimeId, startMinute);
    } catch (err) {
      notifierStore.addTemp({ type: 'error', txt: err.reason });
    }
  } else if (trackerStore.moveInProgress) {
    const timeId = trackerStore.moveInProgress._id;
    const { startMinute } = moveBoxConflictCheck.value;
    trackerStore.moveInProgress = null;
    try {
      await Meteor.callAsync('timeMove', timeId, startMinute);
    } catch (err) {
      notifierStore.addTemp({ type: 'error', txt: err.reason });
    }
  }
}

function prepareResizeTop() {
  // set initial position of resize box the same as the time being resized
  const timeBeingResized = trackerStore.resizeInProgressTop;
  resizeBoxTop.value = `${timeBeingResized.startMinute * trackerStore.pixelsPerMinute}px`;
  resizeBoxBottom.value = `${(1440 - timeBeingResized.endMinute) * trackerStore.pixelsPerMinute + 1}px`;

  // set collision limits (in minutes) to be used in the mousemove method
  resizeBoxTopLimitUpward.value = 0;
  resizeBoxTopLimitDownward.value = timeBeingResized.endMinute - generalStore.tenant.trackerStep;
  // /set collision limits

  resizeBoxTopMinute.value = timeBeingResized.startMinute;
}

function prepareResizeBottom() {
  // set initial position of resize box the same as the time being resized
  const timeBeingResized = trackerStore.resizeInProgressBottom;
  resizeBoxTop.value = `${timeBeingResized.startMinute * trackerStore.pixelsPerMinute}px`;
  resizeBoxBottom.value = `${(1440 - timeBeingResized.endMinute) * trackerStore.pixelsPerMinute + 1}px`;

  // set collision limits (in minutes) to be used in the mousemove method
  resizeBoxBottomLimitUpward.value = timeBeingResized.startMinute + generalStore.tenant.trackerStep;
  resizeBoxBottomLimitDownward.value = 1440;
  // /set collision limits

  resizeBoxBottomMinute.value = timeBeingResized.endMinute;
}

function prepareCopy() {
  // set initial position and color of copy box
  const timeBeingCopied = trackerStore.copyInProgress;
  copyBoxTop.value = `${timeBeingCopied.startMinute * trackerStore.pixelsPerMinute}px`;
  copyBoxBottom.value = `${(1440 - timeBeingCopied.endMinute) * trackerStore.pixelsPerMinute + 1}px`;
  copyBoxConflictCheck.value = {
    conflict: true,
    startMinute: timeBeingCopied.startMinute,
  };
}

function prepareMove() {
  // set initial position and color of move box
  const timeBeingMoved = trackerStore.moveInProgress;
  moveBoxTop.value = `${timeBeingMoved.startMinute * trackerStore.pixelsPerMinute}px`;
  moveBoxBottom.value = `${(1440 - timeBeingMoved.endMinute) * trackerStore.pixelsPerMinute + 1}px`;
  moveBoxConflictCheck.value = {
    conflict: false,
    startMinute: timeBeingMoved.startMinute,
  };
}

function snapPosYToStep(posY, snapToStart) {
  const extraPixels = trackerStore.resizeInProgressTop ? 1 : 0;
  const { pixelsPerMinute } = trackerStore;
  const { trackerStep } = generalStore.tenant;
  const pixelsOver = posY % (pixelsPerMinute * trackerStep);
  if (pixelsOver <= (pixelsPerMinute * trackerStep) / 2 || snapToStart) return posY - pixelsOver + extraPixels;
  return posY - pixelsOver + pixelsPerMinute * trackerStep + extraPixels;
}

// LIVE QUERY TIMES
let trackerQueryTimes = undefined;

watch(() => props.trackerDate, (to, from) => {
  if (trackerQueryTimes) trackerQueryTimes.stop();
  makeQuery1();
}, { immediate: true });

function makeQuery1() {
  trackerQueryTimes = Tracker.autorun(() => {
    const selDate = dayjs.utc(props.trackerDate).hour(0).minute(0).second(0).millisecond(1).toDate();
    times.value = Times.find({ date: selDate, owner: Meteor.userId() }, { sort: { startMinute: 1 } }).fetch();
  });
}
// /LIVE QUERY TIMES

// METEOR CLEANUP
onUnmounted(() => {
  if (trackerQueryTimes) trackerQueryTimes.stop();
});
// /METEOR CLEANUP
</script>

<style scoped>
#time-tracker-base {
  position: relative;
  background-color: #ffffff;
  margin: 0 0 9em 0;
}

.circle-btn {
  position: fixed;
  bottom: 1em;
  right: 1em;
  width: 5em;
  height: 5em;
  background-color: #ffffff;
  border: 1px solid #cecece;
  border-radius: 50%;
  z-index: 2000;
  box-shadow: 0.1em 0.1em 0.2em 0.2em rgba(0, 0, 0, 0.03);
  background-image: url('/icons/plus-green.svg');
  background-repeat: no-repeat;
  background-size: 70% auto;
  background-position: center center;
  transition: all 100ms ease-out;
  user-select: none;
}

.circle-btn:hover {
  transform: scale(1.15);
}

.is-mobile .circle-btn:hover {
  transform: none;
}

.circle-btn-inserting {
  opacity: 0.3;
}

.circle-btn-mode {
  left: 1em;
  right: auto;
  background-image: url('/icons/list.svg');
}

.circle-btn-prev {
  right: 50%;
  margin: 0 1em 0 0;
  background-image: url('/icons/arrow-left.svg');
  background-size: 50% auto;
}

.circle-btn-next {
  left: 50%;
  margin: 0 0 0 1em;
  background-image: url('/icons/arrow-right.svg');
  background-size: 50% auto;
}

.circle-btn-prev .c-tip {
  transform: translateX(-0.9em);
}

.circle-btn-next .c-tip {
  transform: translateX(0.1em);
}

.resize-box {
  position: absolute;
  left: 4.2em;
  right: 1.7em;
  box-shadow: 0.3em 0.3em 0em 0em rgba(0, 0, 0, 0.1);
  border-radius: 0.4em;
  background-color: rgba(255, 165, 0, 0.7);
  z-index: 40;
}

.resize-start {
  position: absolute;
  top: 0;
  right: 31em;
  width: 5em;
  padding: 0.4em 0.5em;
  text-align: right;
  color: white;
  border-radius: 0 0 0 0.5em;
  background-color: #494949;
  border-right: 1px solid #6b6b6b;
  user-select: none;
}

.resize-end {
  position: absolute;
  top: 0;
  right: 25em;
  width: 5em;
  padding: 0.4em 0.5em;
  text-align: left;
  color: white;
  border-radius: 0 0 0.5em 0;
  background-color: #494949;
  user-select: none;
}

.resize-duration {
  position: absolute;
  top: 0;
  right: 6em;
  width: 5em;
  padding: 0.1em 0.5em;
  font-size: 2em;
  text-align: center;
  color: white;
  border-radius: 0 0 0.5em 0.5em;
  background-color: #1c1c1c;
  user-select: none;
}

.copy-box {
  position: absolute;
  left: 4.2em;
  right: 1.7em;
  box-shadow: 0.3em 0.3em 0em 0em rgba(0, 0, 0, 0.1);
  border-radius: 0.4em;
  background-color: rgba(100, 143, 236, 0.9);
  z-index: 40;
}

.copy-box-conflict {
  background-color: rgba(100, 143, 236, 0.7);
}

.move-box {
  position: absolute;
  left: 4.2em;
  right: 1.7em;
  box-shadow: 0.3em 0.3em 0em 0em rgba(0, 0, 0, 0.1);
  border-radius: 0.4em;
  background-color: rgba(243, 177, 91, 0.9);
  z-index: 40;
}

.move-box-conflict {
  background-color: rgba(243, 114, 91, 0.7);
}
</style>
