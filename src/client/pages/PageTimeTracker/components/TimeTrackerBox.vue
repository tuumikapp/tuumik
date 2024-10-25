<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div :style="{ top: timeboxTop, bottom: timeboxBottom, fontSize: baseFontSize }" :class="timeClass" class="timebox">
    <div class="edit-open" @click="setOpenId(time._id)"></div>
    <div v-if="openId === time._id" class="edit-close" @click="setOpenId('')"></div>
    <div v-if="borderHeight && !generalStore.isMobile" :style="{ height: borderHeight }" class="border-top" @mousedown.prevent="trackerStore.resizeInProgressTop = time"></div>
    <div v-if="borderHeight && !generalStore.isMobile" :style="{ height: borderHeight }" class="border-bottom" @mousedown.prevent="trackerStore.resizeInProgressBottom = time"></div>
    <TimeTrackerEditTime
      v-if="openId === time._id"
      :tracker-date="trackerDate"
      :time="time"
      :client="client"
      :project="project"
      :task-groups="taskGroups"
      :style="{ fontSize: generalStore.zoomBody + 'px' }"
      @set-open-id="setOpenId($event)"
    />
    <div v-if="!generalStore.isMobile" class="square-left" @mouseenter=" expandContent = true; raiseToTop = true;" @mouseleave="expandContent = false; raiseToTop = false;"></div>
    <div v-if="!generalStore.isMobile" class="square-right" @mouseenter="raiseToTop = true" @mouseleave="raiseToTop = false">
      <ul :class="{ 'drop-menu-upward': expandUpward }" class="drop-menu">
        <li class="r-delete" @click="timeRemove">DELETE</li>
        <li class="r-edit" @click="setOpenId(time._id)">EDIT</li>
        <li class="r-copy" @mousedown.prevent="trackerStore.copyInProgress = time">DRAG A COPY</li>
        <li class="r-move" @mousedown.prevent="trackerStore.moveInProgress = time">MOVE</li>
        <li class="r-resize-top" @mousedown.prevent="trackerStore.resizeInProgressTop = time">RESIZE TOP</li>
        <li class="r-resize-bottom" @mousedown.prevent="trackerStore.resizeInProgressBottom = time">RESIZE BOTTOM</li>
      </ul>
    </div>
    <ul :class="infoClass" class="info-main">
      <li class="info-item info-client">
        <span v-if="client">{{ client.name }}</span>
        <span v-else>-</span>
      </li>
      <li class="info-item info-project">
        <span v-if="project">{{ project.name }}</span>
        <span v-else>-</span>
      </li>
      <li v-if="time.useTaskType" class="info-item">
        <span v-if="time.taskType">{{ time.taskType }}</span>
        <span v-else>-</span>
      </li>
      <li class="info-item">
        <span v-if="time.taskDesc">{{ time.taskDesc }}</span>
        <span v-else>-</span>
      </li>
      <li v-if="time.intCom" class="info-item info-intcom">{{ time.intCom }}</li>
      <li v-if="time.hideHistory" class="info-item info-hide">HIDDEN</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { useTrackerStore } from '/src/client/stores/tracker.js';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import TimeTrackerEditTime from './TimeTrackerEditTime.vue';
import { Clients, Projects } from '/src/shared/collections/collections.js';

const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();
const trackerStore = useTrackerStore();

const props = defineProps({
  trackerDate: { type: Number, required: true },
  time: { type: Object, required: true },
  taskGroups: { type: Array, required: true },
  openId: { type: String, required: true },
});

const emit = defineEmits(['set-open-id']);

const expandContent = ref(false);
const raiseToTop = ref(false);
const client = ref(null);
const project = ref(null);

const baseFontSize = computed(() => {
  return `${trackerStore.zoomMain}em`;
});

const timeboxTop = computed(() => {
  return `${props.time.startMinute * trackerStore.pixelsPerMinute}px`;
});

const timeboxBottom = computed(() => {
  return `${(1440 - props.time.endMinute) * trackerStore.pixelsPerMinute + 1}px`;
});

const expandUpward = computed(() => {
  if (props.time.startMinute > 1380) {
    return true;
  }
  return false;
});

const borderHeight = computed(() => {
  const timeHeight = (props.time.endMinute - props.time.startMinute + 1) * trackerStore.pixelsPerMinute;
  const zoom = generalStore.zoomBody * trackerStore.zoomMain;
  if (timeHeight > 1.8 * zoom) {
    return `${0.5}em`;
  }
  if (timeHeight <= 1.8 * zoom && timeHeight >= 1.1 * zoom) {
    return `${0.4}em`;
  }
  if (timeHeight <= 1.1 * zoom && timeHeight >= 0.7 * zoom) {
    return `${0.3}em`;
  }
  return false;
});

const timeClass = computed(() => {
  return {
    'timebox-raise': raiseToTop.value,
    'timebox-open': props.openId === props.time._id,
    'timebox-plan': props.time.plan,
    'status-complete': props.time.projectId && props.time.taskDesc && (!props.time.useTaskType || props.time.taskType),
    'status-incomplete': !props.time.projectId || !props.time.taskDesc || (props.time.useTaskType && !props.time.taskType),
  };
});

const infoClass = computed(() => {
  if (!expandContent.value) return '';
  if (expandContent.value && !expandUpward.value) return 'info-main-expand';
  return 'info-main-expand info-main-upward';
});

const clientId = computed(() => {
  if (project.value) return project.value.clientId;
  if (props.time.clientId) return props.time.clientId;
  return '';
});

const projectId = computed(() => {
  return props.time.projectId;
});

function setOpenId(id) {
  emit('set-open-id', id);
}

async function timeRemove() {
  const timeId = props.time._id;
  try {
    await Meteor.callAsync('timeRemove', timeId);
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
  }
}

// SUBSCRIPTION CLIENT
let trackerSubClient = undefined;
let subClient = undefined;
const subClientReady = ref(false);

watch(clientId, (to, from) => {
  if (trackerSubClient) trackerSubClient.stop();
  if (subClient) subClient.stop();
  if (to) makeSubClient();
}, { immediate: true });

function makeSubClient() {
  trackerSubClient = Tracker.autorun(() => {
    subClient = Meteor.subscribe('clientForTime', clientId.value);
    subClientReady.value = subClient.ready();
  });
}
// /SUBSCRIPTION CLIENT

// LIVE QUERY CLIENT
let trackerQueryClient = undefined;

watch(clientId, (to, from) => {
  if (trackerQueryClient) trackerQueryClient.stop();
  makeQueryClient();
}, { immediate: true });

function makeQueryClient() {
  trackerQueryClient = Tracker.autorun(() => {
    client.value = Clients.findOne({ _id: clientId.value });
  });
}
// /LIVE QUERY CLIENT

// SUBSCRIPTION PROJECT
let trackerSubProject = undefined;
let subProject = undefined;
const subProjectReady = ref(false);

watch(projectId, (to, from) => {
  if (trackerSubProject) trackerSubProject.stop();
  if (subProject) subProject.stop();
  if (to) makeSubProject();
}, { immediate: true });

function makeSubProject() {
  trackerSubProject = Tracker.autorun(() => {
    subProject = Meteor.subscribe('projectForTime', projectId.value);
    subProjectReady.value = subProject.ready();
  });
}
// /SUBSCRIPTION PROJECT

// LIVE QUERY PROJECT
let trackerQueryProject = undefined;

watch(projectId, (to, from) => {
  if (trackerQueryProject) trackerQueryProject.stop();
  makeQueryProject();
}, { immediate: true });

function makeQueryProject() {
  trackerQueryProject = Tracker.autorun(() => {
    project.value = Projects.findOne({ _id: projectId.value });
  });
}
// /LIVE QUERY PROJECT

// METEOR CLEANUP
onUnmounted(() => {
  if (trackerSubClient) trackerSubClient.stop();
  if (trackerQueryClient) trackerQueryClient.stop();
  if (trackerSubProject) trackerSubProject.stop();
  if (trackerQueryProject) trackerQueryProject.stop();
  if (subClient) subClient.stop();
  if (subProject) subProject.stop();
});
// /METEOR CLEANUP
</script>

<style scoped>
.timebox {
  position: absolute;
  left: 4.2em;
  right: 1.7em;
  padding: 0 3em;
  border: 1px solid #6f6f6f;
  border-radius: 0.4em;
  background-color: #c4c4c4;
  color: #1f1f1f;
  box-shadow: 0.1em 0.1em 0.2em 0.2em rgba(0, 0, 0, 0.1);
  user-select: none;
}

.is-mobile .timebox {
  left: 3.1em;
  right: 0.6em;
  padding: 0;
}

div .timebox-raise {
  z-index: 100000;
  background-color: orange;
}

div .timebox-open {
  background-color: orange;
}

div .timebox-plan {
  background-color: #9cb8e6;
}

.border-top,
.border-bottom {
  position: absolute;
  left: 2.5em;
  right: 2.5em;
}

.border-top {
  top: 0;
  z-index: 2;
}

.border-bottom {
  bottom: 0;
  z-index: 2;
}

.border-top:hover {
  background-color: rgba(255, 165, 0, 0.8);
  cursor: ns-resize;
}

.border-bottom:hover {
  background-color: rgba(255, 165, 0, 0.8);
  cursor: ns-resize;
}

.square-left {
  position: absolute;
  top: 0;
  left: 0.4em;
  width: 1.8em;
  height: 1.8em;
  max-height: 100%;
  background-color: #1c1c1c;
  border-radius: 0 0 0.4em 0.4em;
  z-index: 2;
}

.square-right {
  position: absolute;
  top: 0;
  right: 0.4em;
  width: 1.8em;
  height: 1.8em;
  max-height: 100%;
  background-color: #1c1c1c;
  border-radius: 0 0 0.4em 0.4em;
  z-index: 2;
}

.drop-menu {
  position: absolute;
  top: 0;
  right: 0;
  width: 20em;
  background-color: #1c1c1c;
  color: #eeeeee;
  border: 0.1em solid rgba(0, 0, 0, 0.3);
  border-radius: 0.2em;
  margin: 0;
  padding: 0 15em 0 0;
  list-style-type: none;
  display: none;
  z-index: 12;
}

.drop-menu-upward {
  top: auto;
  bottom: 0;
}

.square-right:hover .drop-menu {
  display: block;
}

.r-delete,
.r-edit,
.r-copy {
  margin: 0;
  padding: 0 0.4em 0 2.7em;
  height: 2.6em;
  line-height: 2.6em;
  box-sizing: border-box;
  border-bottom: 0.1em solid #3a3a3a;
  border-right: 0.1em solid #3a3a3a;
}

.r-copy {
  border-bottom: none;
  cursor: move;
}

.r-delete:hover,
.r-edit:hover,
.r-copy:hover,
.r-move:hover,
.r-resize-top:hover,
.r-resize-bottom:hover {
  background-color: #262626;
}

.r-resize-top {
  position: absolute;
  top: 0;
  right: 0;
  width: 10em;
  height: 3.9em;
  line-height: 3.9em;
  text-align: center;
  box-sizing: border-box;
  border-bottom: 0.1em solid #3a3a3a;
  cursor: ns-resize;
}

.r-resize-bottom {
  position: absolute;
  top: 3.9em;
  right: 0;
  width: 10em;
  height: 3.9em;
  line-height: 3.9em;
  text-align: center;
  cursor: ns-resize;
}

.r-move {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 10em;
  width: 5em;
  line-height: 7.8em;
  text-align: center;
  box-sizing: border-box;
  border-right: 0.1em solid #3a3a3a;
  cursor: move;
}

.edit-open {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

.edit-close {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #000000;
  opacity: 0.7;
  z-index: 2001;
}

.info-main {
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow-y: hidden;
  max-height: 100%;
  user-select: none;
  cursor: default;
  position: relative;
}

.info-item {
  padding: 0 0.8em;
}

.info-item:last-child {
  border-radius: 0 0 0.4em 0.4em;
  padding-bottom: 0.5em;
}

.info-client {
  color: #000000;
}

.info-project {
  color: #000000;
}

.info-main-upward {
  margin-top: -6em;
}

.info-main-expand {
  overflow-y: visible;
  z-index: 14;
}

.info-main-expand .info-item:last-child {
  border-bottom: 0.1em solid #5b5b5b;
}

.info-intcom {
  color: brown;
}

.info-hide {
  color: green;
}

/* TIME STATUS */
.status-complete {
  background-color: rgba(138, 245, 138, 0.7);
}

.status-complete .info-main-expand .info-item {
  background-color: #2de52d;
}

.status-incomplete {
  background-color: rgba(230, 230, 230, 0.7);
}

.status-incomplete .info-main-expand .info-item {
  background-color: #eaeaea;
}

.status-locked {
  background-color: rgba(255, 165, 0, 0.7);
}

.status-locked .info-main-expand .info-item {
  background-color: #ffc55b;
}
/* /TIME STATUS */
</style>
