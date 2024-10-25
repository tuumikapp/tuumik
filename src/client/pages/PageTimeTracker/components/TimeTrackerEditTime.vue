<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="edit-holder">
    <div class="field-holder time-label-holder">
      <label for="time-start" class="time-label">START</label>
      <label for="time-end" class="time-label">END</label>
      <label for="dur-h" class="time-label">HOURS</label>
      <label for="dur-m" class="time-label">MINUTES</label>
    </div>
    <div class="field-holder">
      <label class="field-label">TIME:</label>
      <div class="time-holder">
        <input id="time-start" :value="startTimeInputValue()" placeholder="START" type="time" step="60" class="time-inp" @blur="saveStartTime($event)" />
        <input id="time-end" :value="endTimeInputValue()" placeholder="END" type="time" step="60" class="time-inp" @blur="saveEndTime($event)" />
        <input id="dur-h" :value="durHoursInputValue()" placeholder="hours" type="number" min="0" max="23" step="1" @blur="saveDuration()" />
        <input id="dur-m" :value="durMinutesInputValue()" placeholder="minutes" type="number" min="0" max="59" step="1" @blur="saveDuration()" />
      </div>
    </div>
    <div class="field-holder">
      <label class="field-label">CLIENT:</label>
      <AutoComplete v-if="!time.projectId && !time.clientId" ac-type="clients" hint="CLIENTS" @autocomplete-pick="selectAcClient($event)" />
      <div v-else-if="client" class="client-picked">
        <div class="clear-client" @click="clearClient()"></div>
        {{ client.name }}
      </div>
      <div v-else>loading</div>
    </div>
    <div class="field-holder">
      <label class="field-label">PROJECT:</label>
      <AutoComplete v-if="!time.projectId && !time.clientId" ac-type="projects" hint="PROJECTS" @autocomplete-pick="selectAcProject($event)" />
      <select v-else-if="!time.projectId && time.clientId && selProjects" class="sel" @change="projectListSelect($event)">
        <option selected disabled>PROJECTS: {{ selProjects.length }}</option>
        <option v-for="selProject in selProjects" :key="selProject._id" :value="selProject._id">{{ selProject.name }}</option>
      </select>
      <div v-else-if="project" class="project-picked">
        <div class="clear-project" @click="clearProject()"></div>
        {{ project.name }}
      </div>
      <div v-else>loading</div>
    </div>
    <div v-if="time.useTaskType" class="field-holder">
      <label class="field-label">TYPE:</label>
      <select v-model="taskTypeVal" class="sel">
        <option value=""></option>
        <option v-for="taskType in taskTypes" :key="taskType.txt" :value="taskType.txt">{{ taskType.txt }}</option>
      </select>
    </div>
    <div class="field-holder">
      <label class="field-label">DESCRIPTION:</label>
      <input :value="time.taskDesc" placeholder="DESCRIPTION" type="text" maxlength="500" class="inp" @blur="saveTaskDesc($event)" />
    </div>
    <div v-if="!trackerSimple" class="field-holder">
      <label class="field-label">MISC:</label>
      <div v-if="generalStore.tenant.trackerStep === 12" class="misc-holder">
        <div class="end-now" @click="saveEndTime('', true)">END NOW</div>
        <div class="fixed-duration" @click="saveDuration(24)">0.4h</div>
        <div class="fixed-duration" @click="saveDuration(60)">1h</div>
        <div class="fixed-duration" @click="saveDuration(96)">1.6h</div>
        <div class="fixed-duration" @click="saveDuration(120)">2h</div>
        <div class="fixed-duration" @click="saveDuration(144)">2.4h</div>
        <div class="fixed-duration" @click="saveDuration(180)">3h</div>
        <div class="add-duration" @click="saveDurationAdd(-24)">-24m</div>
        <div class="add-duration" @click="saveDurationAdd(-12)">-12m</div>
        <div class="add-duration" @click="saveDurationAdd(12)">+12m</div>
        <div class="add-duration" @click="saveDurationAdd(24)">+24m</div>
        <div class="move-position" @click="saveMovePosition(-24)">-24m</div>
        <div class="move-position" @click="saveMovePosition(24)">+24m</div>
      </div>
      <div v-else-if="generalStore.tenant.trackerStep === 15" class="misc-holder">
        <div class="end-now" @click="saveEndTime('', true)">END NOW</div>
        <div class="fixed-duration" @click="saveDuration(30)">0.5h</div>
        <div class="fixed-duration" @click="saveDuration(60)">1h</div>
        <div class="fixed-duration" @click="saveDuration(90)">1.5h</div>
        <div class="fixed-duration" @click="saveDuration(120)">2h</div>
        <div class="fixed-duration" @click="saveDuration(150)">2.5h</div>
        <div class="fixed-duration" @click="saveDuration(180)">3h</div>
        <div class="add-duration" @click="saveDurationAdd(-30)">-30m</div>
        <div class="add-duration" @click="saveDurationAdd(-15)">-15m</div>
        <div class="add-duration" @click="saveDurationAdd(15)">+15m</div>
        <div class="add-duration" @click="saveDurationAdd(30)">+30m</div>
        <div class="move-position" @click="saveMovePosition(-15)">-15m</div>
        <div class="move-position" @click="saveMovePosition(15)">+15m</div>
      </div>
      <div v-else-if="generalStore.tenant.trackerStep === 30" class="misc-holder">
        <div class="end-now" @click="saveEndTime('', true)">END NOW</div>
        <div class="fixed-duration" @click="saveDuration(30)">0.5h</div>
        <div class="fixed-duration" @click="saveDuration(60)">1h</div>
        <div class="fixed-duration" @click="saveDuration(90)">1.5h</div>
        <div class="fixed-duration" @click="saveDuration(120)">2h</div>
        <div class="fixed-duration" @click="saveDuration(150)">2.5h</div>
        <div class="fixed-duration" @click="saveDuration(180)">3h</div>
        <div class="add-duration" @click="saveDurationAdd(-60)">-1h</div>
        <div class="add-duration" @click="saveDurationAdd(-30)">-0.5h</div>
        <div class="add-duration" @click="saveDurationAdd(30)">+0.5h</div>
        <div class="add-duration" @click="saveDurationAdd(60)">+1h</div>
        <div class="move-position" @click="saveMovePosition(-30)">-30m</div>
        <div class="move-position" @click="saveMovePosition(30)">+30m</div>
      </div>
      <div v-else class="misc-holder">
        <div class="end-now" @click="saveEndTime('', true)">END NOW</div>
        <div class="fixed-duration" @click="saveDuration(30)">0.5h</div>
        <div class="fixed-duration" @click="saveDuration(60)">1h</div>
        <div class="fixed-duration" @click="saveDuration(90)">1.5h</div>
        <div class="fixed-duration" @click="saveDuration(120)">2h</div>
        <div class="fixed-duration" @click="saveDuration(150)">2.5h</div>
        <div class="fixed-duration" @click="saveDuration(180)">3h</div>
        <div class="add-duration" @click="saveDurationAdd(-18)">-18m</div>
        <div class="add-duration" @click="saveDurationAdd(-6)">-6m</div>
        <div class="add-duration" @click="saveDurationAdd(6)">+6m</div>
        <div class="add-duration" @click="saveDurationAdd(18)">+18m</div>
        <div class="move-position" @click="saveMovePosition(-18)">-18m</div>
        <div class="move-position" @click="saveMovePosition(18)">+18m</div>
      </div>
    </div>
    <TimeTrackerPrimary :time="time" :client="client" :project="project" :task-groups="taskGroups" />
    <TimeTrackerSecondary v-if="!trackerSimple" :time="time" :client="client" :project="project" :task-groups="taskGroups" />
    <div class="bottom-bar">
      <div class="remove-btn" @click="timeRemove()">DELETE</div>
      <div class="copy-btn" @click="timeCopy()">COPY</div>
      <div v-if="trackerSimple" class="copy-btn" @click="trackerSimple = false">
        MORE
      </div>
    </div>
    <div class="bottom-bar">
      <div :class="{ 'plan-btn-on': time.plan }" class="plan-btn" @click="setPlan()">
        PLAN
      </div>
      <div class="date-btn" @click="showDateEditor = !showDateEditor">DATE</div>
    </div>
    <TimeTrackerDateEditor v-if="showDateEditor" :time="time" />
    <div class="circle-btn" @click="closeEditor()">
      <span class="c-tip c-tip-rev">CLOSE EDITOR</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import dayjs from 'dayjs';
import TimeTrackerPrimary from './TimeTrackerPrimary.vue';
import TimeTrackerSecondary from './TimeTrackerSecondary.vue';
import TimeTrackerDateEditor from './TimeTrackerDateEditor.vue';
import AutoComplete from '/src/client/components/AutoComplete/AutoComplete.vue';
import { Projects } from '/src/shared/collections/collections.js';
import { minutesToHHMM } from '/src/shared/utils/time.js';

const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();

const props = defineProps({
  trackerDate: { type: Number, required: true },
  time: { type: Object, required: true },
  taskGroups: { type: Array, required: true },
  client: { type: Object, default: null },
  project: { type: Object, default: null },
});

const emit = defineEmits(['set-open-id']);

const selProjects = ref([]);
const trackerSimple = ref(false);
const showDateEditor = ref(false);

trackerSimple.value = generalStore.trackerSimple;

const clientId = computed(() => {
  return props.time.clientId;
});

const taskTypes = computed(() => {
  let typesOut = [];
  for (let i = 0; i < props.taskGroups.length; i += 1) {
    if ((!props.project && props.taskGroups[i].showByDefault) || (props.project?.taskGroupIds.includes(props.taskGroups[i]._id) && props.taskGroups[i].types)) {
      typesOut = typesOut.concat(props.taskGroups[i].types);
    }
  }
  if (props.time.taskType && !typesOut.find(x => x.txt === props.time.taskType)) typesOut.unshift({ txt: props.time.taskType });
  return typesOut;
});

const taskTypeVal = computed({
  get() {
    return props.time.taskType;
  },
  set(newValue) {
    saveTaskType(newValue);
  },
});

onMounted(() => {
  document.addEventListener('keyup', keyupHandler);
});

onUnmounted(() => {
  document.removeEventListener('keyup', keyupHandler);
  closeEditor();
});

async function saveTaskType(taskType) {
  const timeId = props.time._id;
  try {
    await Meteor.callAsync('timeTaskType', timeId, taskType);
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
  }
}

function keyupHandler(event) {
  if (event.key === 'Escape') closeEditor();
}

function closeEditor() {
  emit('set-open-id', '');
}

function startTimeInputValue() {
  return minutesToHHMM(props.time.startMinute);
}

function endTimeInputValue() {
  return minutesToHHMM(props.time.endMinute);
}

function durHoursInputValue() {
  const minutes = props.time.endMinute - props.time.startMinute;
  return Math.floor(minutes / 60);
}

function durMinutesInputValue() {
  const minutes = props.time.endMinute - props.time.startMinute;
  return minutes % 60;
}

async function saveStartAndEnd(startMinute, endMinute) {
  const timeId = props.time._id;
  try {
    await Meteor.callAsync('timeStartAndEnd', timeId, startMinute, endMinute);
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
  }
}

function saveStartTime(event) {
  const val = event.target.value;
  const valHours = Number.parseInt(val.substring(0, 2), 10);
  const valMinutes = Number.parseInt(val.substring(3, 5), 10);
  let startMinute = valHours * 60 + valMinutes;

  // snap
  const { trackerStep } = generalStore.tenant;
  const minutesOver = startMinute % trackerStep;
  startMinute -= minutesOver;
  // /snap

  const { endMinute } = props.time;
  if (startMinute >= endMinute) startMinute = endMinute - trackerStep;
  if (startMinute < 0) startMinute = 0;
  if (startMinute > 1440) startMinute = 1440 - trackerStep;
  saveStartAndEnd(startMinute, endMinute);
}

function saveEndTime(event, setToNow) {
  const val = setToNow ? dayjs().format('HH:mm') : event.target.value;
  const valHours = Number.parseInt(val.substring(0, 2), 10);
  const valMinutes = Number.parseInt(val.substring(3, 5), 10);
  let endMinute = valHours * 60 + valMinutes;

  // snap
  const { trackerStep } = generalStore.tenant;
  const minutesOver = endMinute % trackerStep;
  endMinute -= minutesOver;
  // /snap

  const { startMinute } = props.time;
  if (startMinute >= endMinute) endMinute = startMinute + trackerStep;
  if (endMinute < 0) endMinute = 1;
  if (endMinute > 1440) endMinute = 1440;
  saveStartAndEnd(startMinute, endMinute);
}

function saveDuration(fixedMinutes) {
  let dur = 0;
  if (!fixedMinutes) {
    const valInpHours = document.getElementById('dur-h').value;
    let valHours = Number.parseInt(valInpHours, 10);
    if (valHours > 23) valHours = 23;
    if (valHours < 0) valHours = 0;
    const valInpMinutes = document.getElementById('dur-m').value;
    let valMinutes = Number.parseInt(valInpMinutes, 10);
    if (valMinutes > 59) valMinutes = 59;
    if (valMinutes < 0) valMinutes = 0;
    dur = valHours * 60 + valMinutes;
  } else {
    dur = fixedMinutes;
  }
  if (dur === 0) dur = 1;
  let endMinute;
  let startMinute;
  if (props.time.startMinute + dur <= 1440) {
    ({ startMinute } = props.time);
    endMinute = startMinute + dur;
  } else {
    startMinute = 1439 - dur;
    endMinute = 1439;
  }
  if (startMinute >= endMinute) endMinute = startMinute + 1;
  if (endMinute < 0) endMinute = 0;
  if (endMinute > 1440) endMinute = 1440;
  saveStartAndEnd(startMinute, endMinute);
}

function saveDurationAdd(minutes) {
  const durOrig = props.time.endMinute - props.time.startMinute;
  const durNew = durOrig + minutes;
  let endMinute;
  let startMinute;
  if (props.time.startMinute + durNew <= 1440) {
    ({ startMinute } = props.time);
    endMinute = startMinute + durNew;
  } else {
    startMinute = 1439 - durNew;
    endMinute = 1439;
  }
  if (startMinute >= endMinute) endMinute = startMinute + 1;
  if (endMinute < 0) endMinute = 0;
  if (endMinute > 1440) endMinute = 1440;
  saveStartAndEnd(startMinute, endMinute);
}

function saveMovePosition(minutes) {
  const dur = props.time.endMinute - props.time.startMinute;
  let startMinute = props.time.startMinute + minutes;
  let endMinute = props.time.endMinute + minutes;
  if (startMinute < 0) {
    startMinute = 0;
    endMinute = startMinute + dur;
  } else if (endMinute >= 1440) {
    startMinute = 1440 - dur;
    endMinute = 1440;
  }
  saveStartAndEnd(startMinute, endMinute);
}

async function selectAcClient(result) {
  const timeId = props.time._id;
  const clientId = result._id;
  try {
    await Meteor.callAsync('timeClientId', timeId, clientId);
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
  }
}

async function selectAcProject(result) {
  const timeId = props.time._id;
  const projectId = result._id;
  try {
    await Meteor.callAsync('timeProjectId', timeId, projectId);
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
  }
}

async function clearClient() {
  const timeId = props.time._id;
  try {
    await Meteor.callAsync('timeClearClient', timeId);
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
  }
}

async function clearProject() {
  const timeId = props.time._id;
  try {
    await Meteor.callAsync('timeClearProject', timeId);
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
  }
}

async function projectListSelect(event) {
  const timeId = props.time._id;
  const projectId = event.target.value;
  try {
    await Meteor.callAsync('timeProjectId', timeId, projectId);
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
  }
}

async function saveTaskDesc(event) {
  const timeId = props.time._id;
  const taskDesc = event.target.value;
  if (taskDesc !== props.time.taskDesc) {
    try {
      await Meteor.callAsync('timeTaskDesc', timeId, taskDesc);
    } catch (err) {
      notifierStore.addTemp({ type: 'error', txt: err.reason });
    }
  }
}

async function timeRemove() {
  const timeId = props.time._id;
  try {
    await Meteor.callAsync('timeRemove', timeId);
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
  }
}

async function timeCopy() {
  const sourceTimeId = props.time._id;
  const now = new Date();
  const startMinute = now.getHours() * 60 + now.getMinutes();
  try {
    await Meteor.callAsync('timeInsertCopy', sourceTimeId, startMinute);
    closeEditor();
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
  }
}

async function setPlan() {
  const timeId = props.time._id;
  const plan = !props.time.plan;
  try {
    await Meteor.callAsync('timeSetPlan', timeId, plan);
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
  }
}

// SUBSCRIPTION PROJECTS
let trackerSubProjects = undefined;
let subProjects = undefined;
const subProjectsReady = ref(false);

watch(clientId, (to, from) => {
  if (trackerSubProjects) trackerSubProjects.stop();
  if (subProjects) subProjects.stop();
  if (to) makeSubProjects();
}, { immediate: true });

function makeSubProjects() {
  trackerSubProjects = Tracker.autorun(() => {
    subProjects = Meteor.subscribe('projectsForClientInTime', clientId.value);
    subProjectsReady.value = subProjects.ready();
  });
}
// /SUBSCRIPTION PROJECTS

// LIVE QUERY PROJECTS
let trackerQueryProjects = undefined;

watch(clientId, (to, from) => {
  if (trackerQueryProjects) trackerQueryProjects.stop();
  makeQueryProjects();
}, { immediate: true });

function makeQueryProjects() {
  trackerQueryProjects = Tracker.autorun(() => {
    selProjects.value = Projects.find({ clientId: clientId.value }, { sort: { created: 1 } }).fetch();
  });
}
// /LIVE QUERY PROJECTS

// METEOR CLEANUP
onUnmounted(() => {
  if (trackerSubProjects) trackerSubProjects.stop();
  if (trackerQueryProjects) trackerQueryProjects.stop();
  if (subProjects) subProjects.stop();
});
// /METEOR CLEANUP
</script>

<style scoped>
.edit-holder {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1em;
  width: 70%;
  min-width: 50em;
  max-width: 120em;
  height: 50em;
  max-height: 70%;
  margin: auto;
  background-color: #ffffff;
  border: 4px solid #e0e0e0;
  border-radius: 0.2em;
  z-index: 3002;
  box-shadow: 0.3em 0.3em 0em 0em rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.is-mobile .edit-holder {
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: auto;
  width: auto;
  padding-bottom: 9em;
  min-width: initial;
  max-width: initial;
  max-height: initial;
  border: none;
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
  z-index: 2010;
  box-shadow: 0.1em 0.1em 0.2em 0.2em rgba(0, 0, 0, 0.03);
  background-image: url('/icons/close-dark.svg');
  background-repeat: no-repeat;
  background-size: 70% auto;
  background-position: center center;
  transition: all 100ms ease-out;
  user-select: none;
}

.circle-btn:hover {
  transform: scale(1.15);
}

.field-holder {
  padding: 0.2em 0 0.2em 10em;
  margin: 0.2em 0;
  position: relative;
}

.is-mobile .field-holder {
  padding: 0.2em 0;
}

.field-label {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  height: 2em;
  line-height: 2em;
  width: 10em;
  margin: auto;
  z-index: -1;
  padding: 0 0 0 1em;
  background-color: #eeeeee;
  color: #1f1f1f;
  border-radius: 0.3em 0 0 0.3em;
}

.is-mobile .field-label {
  display: none;
}

.time-label-holder {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 -0.4em 0;
}

.time-label {
  width: 24%;
  font-size: 0.9em;
  color: #7f7f7f;
  padding: 0.2em 0;
  margin: 0 0 -3px 0;
  text-align: center;
}

.time-holder {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

#dur-h,
#dur-m {
  width: 24%;
  padding-top: 0.65em;
  padding-bottom: 0.65em;
  color: #336600;
}

.sel,
.inp {
  width: 100%;
}

.time-inp {
  width: 24%;
}

.client-picked {
  padding: 1em;
  background-color: #dfdfdf;
}

.is-mobile .client-picked {
  margin-right: 2.5em;
}

.clear-client {
  position: absolute;
  top: 0.2em;
  bottom: 0.2em;
  left: 7em;
  width: 2em;
  background-color: #ffa500;
  border-radius: 0.2em;
  background-image: url('/icons/close-light.svg');
  background-repeat: no-repeat;
  background-size: 70% auto;
  background-position: center center;
}

.is-mobile .clear-client {
  left: auto;
  right: 0;
  width: 2em;
}

.clear-client:hover {
  background-color: grey;
}

.project-picked {
  padding: 1em;
  background-color: #dfdfdf;
}

.is-mobile .project-picked {
  margin-right: 2.5em;
}

.clear-project {
  position: absolute;
  top: 0.2em;
  bottom: 0.2em;
  left: 7em;
  width: 2em;
  background-color: #ffa500;
  border-radius: 0.2em;
  background-image: url('/icons/close-light.svg');
  background-repeat: no-repeat;
  background-size: 70% auto;
  background-position: center center;
}

.is-mobile .clear-project {
  left: auto;
  right: 0;
  width: 2em;
}

.clear-project:hover {
  background-color: grey;
}

.misc-holder {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.is-mobile .misc-holder {
  justify-content: space-between;
}

.end-now {
  width: 12em;
  padding: 0.65em 0;
  margin: 2px 4px 2px 0;
  text-align: center;
  background-color: #f9f9f9;
  border: 1px solid #cecece;
  color: #ff0000;
  border-radius: 0.4em;
}

.end-now:hover {
  background-color: #ffffff;
}

.fixed-duration {
  width: 3.5em;
  padding: 0.65em 0;
  margin: 2px 4px 2px 0;
  text-align: center;
  background-color: #f9f9f9;
  border: 1px solid #cecece;
  color: #006600;
  border-radius: 0.4em;
}

.fixed-duration:hover {
  background-color: #ffffff;
}

.add-duration {
  width: 3.5em;
  padding: 0.65em 0;
  margin: 2px 4px 2px 0;
  text-align: center;
  background-color: #f9f9f9;
  border: 1px solid #cecece;
  color: #0000ff;
  border-radius: 0.4em;
}

.add-duration:hover {
  background-color: #ffffff;
}

.move-position {
  width: 3.5em;
  padding: 0.65em 0;
  margin: 2px 4px 2px 0;
  text-align: center;
  background-color: #f9f9f9;
  border: 1px solid #cecece;
  color: #ff0000;
  border-radius: 0.4em;
}

.move-position:hover {
  background-color: #ffffff;
}

.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 1.5em 0 0 0;
  padding: 1.5em 0 0 0;
  border-top: 1px solid #e4e4e4;
}

.remove-btn,
.copy-btn,
.date-btn {
  color: #1f1f1f;
  width: 6em;
  height: 4em;
  line-height: 4em;
  background-color: #f9f9f9;
  border: 1px solid #cecece;
  border-radius: 0.4em;
  margin: 0 1em 0 0;
  text-align: center;
}

.remove-btn:hover,
.copy-btn:hover,
.date-btn:hover {
  background-color: #ffffff;
}

.plan-btn {
  color: #1f1f1f;
  width: 6em;
  height: 4em;
  line-height: 4em;
  background-color: #f9f9f9;
  border: 1px solid #cecece;
  border-radius: 0.4em;
  margin: 0 1em 0 0;
  text-align: center;
}

.plan-btn:hover {
  background-color: #ffffff;
}

.plan-btn-on {
  background-color: #9bccec;
  border: 1px solid #6c95b1;
}

.plan-btn-on:hover {
  background-color: #8bc4eb;
}
</style>
