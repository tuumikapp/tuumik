<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <InOutListDesk
      v-if="viewMode === 'list' && !generalStore.isMobile"
      :in-out-users="inOutUsers"
      :edit-user="editUser"
      :selected-team="selectedTeam"
      :selected-user="selectedUser"
      :time-now="timeNow"
      @set-edit-user="editUser = $event"
    />
    <InOutListMobile
      v-if="viewMode === 'list' && generalStore.isMobile"
      :in-out-users="inOutUsers"
      :edit-user="editUser"
      :selected-team="selectedTeam"
      :selected-user="selectedUser"
      :time-now="timeNow"
      @set-edit-user="editUser = $event"
    />
    <InOutIconsDesk
      v-if="viewMode === 'icons' && !generalStore.isMobile"
      :in-out-users="inOutUsers"
      :edit-user="editUser"
      :selected-team="selectedTeam"
      :selected-user="selectedUser"
      :time-now="timeNow"
      @set-edit-user="editUser = $event"
    />
    <InOutIconsMobile
      v-if="viewMode === 'icons' && generalStore.isMobile"
      :in-out-users="inOutUsers"
      :edit-user="editUser"
      :selected-team="selectedTeam"
      :selected-user="selectedUser"
      :time-now="timeNow"
      @set-edit-user="editUser = $event"
    />

    <div v-if="subUsersReady && !inOutUsers.length" class="no-results">
      NO RESULTS
    </div>

    <div v-if="editUser" class="edit-holder">
      <div class="edit-name">{{ editUser.name }}</div>
      <div class="status-holder">
        <div
          v-for="inOutOption in generalStore.tenant.inOutOptions"
          :key="inOutOption.id"
          :class="{ 'statusrow-on': editUser.inOutStatus === inOutOption.id }"
          class="statusrow"
          @click="setInOutStatus(inOutOption.id)"
        >
          {{ inOutOption.text }}
          <div :style="{ backgroundColor: inOutOption.colorBG }" class="statusrow-circle"></div>
        </div>
      </div>
      <ul class="eta-ul">
        <li class="eta-li" @click="setInOutETA('clear')">CLEAR</li>
        <li class="eta-li" @click="setInOutETA('15m')">15m</li>
        <li class="eta-li" @click="setInOutETA('30m')">30m</li>
        <li class="eta-li" @click="setInOutETA('1h')">1h</li>
        <li class="eta-li" @click="setInOutETA('2h')">2h</li>
        <li class="eta-li" @click="setInOutETA('3h')">3h</li>
        <li class="eta-li" @click="setInOutETA('4h')">4h</li>
        <li class="eta-li" @click="setInOutETA('evening')">EVENING</li>
        <li class="eta-li" @click="setInOutETA('tomorrow')">TOMORROW</li>
      </ul>
      <div class="note-text" @click="noteNew = editUser.inOutNote; showNoteInput = true;">
        {{ editUser.inOutNote }}
      </div>
      <form v-if="showNoteInput" class="note-form" @submit.prevent="setInOutNote(); showNoteInput = false;">
        <input v-model="noteNew" type="text" maxlength="200" placeholder="NOTE" class="note-input" />
        <input type="submit" value="ENTER" class="note-btn-submit" />
        <span class="note-clear-btn" @click="clearInOutNote()">CLEAR</span>
        <span class="note-cancel-btn" @click="showNoteInput = false">CANCEL</span>
      </form>
    </div>
    <div v-if="editUser" class="edit-close" @click="editUser = null; showNoteInput = false;"></div>

    <div v-if="showTeamsPopup" class="teams-popup">
      <div class="teams-title">SHOW USER</div>
      <AutoComplete ac-type="users" hint="USERS" clear-after class="user-autocomplete-holder" @autocomplete-pick="addUserFromAc($event)" />
      <div class="teams-title">SHOW TEAM</div>
      <ul v-if="generalStore.tenant.teams.length" class="teams-ul">
        <li
          v-for="team in generalStore.tenant.teams"
          :key="team.id"
          :class="{
            'teams-li-on': selectedTeam && selectedTeam.id === team.id && !selectedUser,
          }"
          class="teams-li"
          @click="selectTeam(team)"
        >
          {{ team.name }}
        </li>
      </ul>
      <div v-else>NO TEAMS FOUND</div>
    </div>
    <div v-if="showTeamsPopup" class="teams-close" @click="showTeamsPopup = false"></div>

    <div class="circle-btn" @click="showTeamsPopup = !showTeamsPopup">
      <span class="c-tip c-tip-rev">TEAMS AND USERS</span>
    </div>
    <div v-if="viewMode === 'list'" class="circle-btn circle-btn-icons" @click="selectViewMode('icons')">
      <span class="c-tip c-tip-rev">ICONS VIEW</span>
    </div>
    <div v-else class="circle-btn circle-btn-list" @click="selectViewMode('list')">
      <span class="c-tip c-tip-rev">LIST VIEW</span>
    </div>

    <div v-if="!subUsersReady" class="spinner spinner-global"></div>
    <div v-if="loading" class="spinner spinner-global"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import dayjs from 'dayjs';
import InOutListDesk from './components/InOutListDesk.vue';
import InOutListMobile from './components/InOutListMobile.vue';
import InOutIconsDesk from './components/InOutIconsDesk.vue';
import InOutIconsMobile from './components/InOutIconsMobile.vue';
import AutoComplete from '/src/client/components/AutoComplete/AutoComplete.vue';

const generalStore = useGeneralStore();

const inOutUsers = ref([]);
const viewMode = ref('list');
const editUser = ref(null);
const showNoteInput = ref(false);
const sortByStatus = ref(false);
const noteNew = ref('');
const timeNow = ref(null);
const showTeamsPopup = ref(false);
const selectedTeam = ref(null);
const selectedUser = ref(null);
const loading = ref(false);

let interval = undefined;
timeNow.value = new Date();

onMounted(() => {
  const teamId = localStorage.inOutTeamId || '';
  const teams = generalStore.tenant.teams;
  if (teams.length) {
    if (teamId) {
      const team = teams.find(x => x.id === teamId);
      if (team) selectedTeam.value = team;
    } else {
      selectedTeam.value = teams[0];
    }
  }

  viewMode.value = localStorage.inOutViewMode || 'list';

  interval = setInterval(() => {
    timeNow.value = new Date();
  }, 60000);
});

onUnmounted(() => {
  clearInterval(interval);
});

async function setInOutStatus(status) {
  loading.value = true;
  const targetUserId = editUser.value?._id;
  editUser.value = null;
  try {
    await Meteor.callAsync('setInOutStatusOthers', targetUserId, status);
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function setInOutNote() {
  loading.value = true;
  const targetUserId = editUser.value?._id;
  editUser.value.inOutNote = noteNew.value;
  try {
    await Meteor.callAsync('setInOutNoteOthers', targetUserId, noteNew.value);
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function clearInOutNote() {
  noteNew.value = '';
  setInOutNote();
  showNoteInput.value = false;
}

function makeETADesc(eta) {
  const dateFormat = generalStore.tenant.dateFormat;
  const timeFormat = generalStore.tenant.timeFormat;
  if (eta === 'clear') return '';
  if (eta === '15m') return `${dayjs().add(15, 'minutes').format(timeFormat)} (15m)`;
  if (eta === '30m') return `${dayjs().add(30, 'minutes').format(timeFormat)} (30m)`;
  if (eta === '1h') return `${dayjs().add(1, 'hours').format(timeFormat)} (1h)`;
  if (eta === '2h') return `${dayjs().add(2, 'hours').format(timeFormat)} (2h)`;
  if (eta === '3h') return `${dayjs().add(3, 'hours').format(timeFormat)} (3h)`;
  if (eta === '4h') return `${dayjs().add(4, 'hours').format(timeFormat)} (4h)`;
  if (eta === 'evening') return `${dayjs().format(dateFormat)} (evening)`;
  if (eta === 'tomorrow') return `${dayjs().add(1, 'days').format(dateFormat)} (tomorrow)`;
  return '';
}

async function setInOutETA(eta) {
  loading.value = true;
  const desc = makeETADesc(eta);
  const targetUserId = editUser.value?._id;
  editUser.value.inOutETA = desc;
  try {
    await Meteor.callAsync('setInOutETAOthers', targetUserId, desc);
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function selectTeam(team) {
  selectedTeam.value = team;
  localStorage.inOutTeamId = team.id;
  selectedUser.value = null;
}

function selectViewMode(mode) {
  viewMode.value = mode;
  localStorage.inOutViewMode = mode;
}

function addUserFromAc(result) {
  selectedUser.value = result;
  selectedTeam.value = null;
}

// SUBSCRIPTION USERS
let trackerSubUsers = undefined;
let subUsers = undefined;
const subUsersReady = ref(false);

watch([selectedUser, selectedTeam], ([toUser, toTeam], [fromUser, fromTeam]) => {
  if (trackerSubUsers) trackerSubUsers.stop();
  if (subUsers) subUsers.stop();
  makeSubUsers();
}, { immediate: true });

function makeSubUsers() {
  trackerSubUsers = Tracker.autorun(() => {
    let selectedUserId = '';
    let selectedTeamId = '';
    if (selectedUser.value) {
      selectedUserId = selectedUser.value._id || '';
    } else if (selectedTeam.value) {
      selectedTeamId = selectedTeam.value.id || '';
    }
    subUsers = Meteor.subscribe('inOutUsers', selectedUserId, selectedTeamId);
    subUsersReady.value = subUsers.ready();
  });
}
// /SUBSCRIPTION USERS

// LIVE QUERY USERS
let trackerQueryUsers = undefined;

watch(selectedUser, (to, from) => {
  if (trackerQueryUsers) trackerQueryUsers.stop();
  makeQueryUsers();
}, { immediate: true });

watch(selectedTeam, (to, from) => {
  if (trackerQueryUsers) trackerQueryUsers.stop();
  makeQueryUsers();
});

function makeQueryUsers() {
  trackerQueryUsers = Tracker.autorun(() => {
    const selectedTeamId = selectedTeam.value ? selectedTeam.value?.id : '';
    const queryForUser = { _id: selectedUser.value?._id, inOutShow: true };
    const queryForTeams = { inTeams: selectedTeamId, inOutShow: true };
    const query = selectedUser.value ? queryForUser : queryForTeams;
    let sort = { name: 1 };
    if (sortByStatus.value) sort = { inOutStatus: 1, name: 1 };
    inOutUsers.value = Meteor.users.find(query, { sort }).fetch();
  });
}
// /LIVE QUERY USERS

// METEOR CLEANUP
onUnmounted(() => {
  if (trackerSubUsers) trackerSubUsers.stop();
  if (trackerQueryUsers) trackerQueryUsers.stop();
  if (subUsers) subUsers.stop();
});
// /METEOR CLEANUP
</script>

<style scoped>
/* USER EDITOR */
.edit-holder {
  position: fixed;
  top: 12em;
  left: 0;
  right: 0;
  margin: 0 auto;
  padding: 6.3em 7em 0 0;
  width: 14em;
  min-height: 20em;
  background-color: #ffffff;
  border-radius: 0.2em;
  box-shadow: 0.3em 0.3em 0em 0em rgba(0, 0, 0, 0.1);
  z-index: 1021;
}

.is-mobile .edit-holder {
  top: 7em;
}

.edit-close {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: black;
  opacity: 0.4;
  z-index: 1020;
}

.edit-name {
  position: absolute;
  top: 0.3em;
  left: 0.3em;
  right: 0.3em;
  height: 2em;
  line-height: 2em;
  padding: 0 0.6em;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: #ffffff;
  color: black;
  border-radius: 0.2em;
}

.eta-ul {
  position: absolute;
  top: 6.3em;
  bottom: 0;
  right: 0.3em;
  width: 6.7em;
  margin: 0;
  padding: 0;
  list-style-type: none;
  text-align: center;
  overflow-y: auto;
}

.eta-li {
  margin: 0.3em 0;
  padding: 0.6em 0.2em;
  background-color: #e0e0e0;
  user-select: none;
}

.eta-li:hover {
  background-color: #f1f1f1;
}

.is-mobile .eta-li {
  padding: 1em 0.2em;
}

.note-text {
  position: absolute;
  top: 2.6em;
  left: 0.3em;
  right: 0.3em;
  height: 2.6em;
  padding: 0.5em;
  background-color: #e0e0e0;
  color: #1f1f1f;
  overflow-y: auto;
  display: flex;
  justify-content: left;
  align-items: center;
}

.note-text:hover {
  background-color: #f1f1f1;
}

.note-form {
  position: absolute;
  top: 2.6em;
  left: 0.3em;
  right: 0.3em;
  height: 7.9em;
  background-color: #f9f9f9;
}

.note-input {
  height: 3.6em;
  width: 100%;
}

.note-btn-submit {
  position: absolute;
  top: 3.9em;
  right: 0;
  height: 3.6em;
  line-height: 3.6em;
  padding: 0;
  width: 39%;
  background-color: #00ab6a;
  color: #f9f9f9;
  border: none;
  border-radius: 0.3em;
  font-weight: 600;
  user-select: none;
  text-align: center;
}

.note-btn-submit:hover {
  background-color: #02c97c;
  color: #ffffff;
}

.note-clear-btn {
  position: absolute;
  top: 3.9em;
  left: 0;
  right: 0;
  margin: 0 auto;
  height: 3.6em;
  line-height: 3.6em;
  padding: 0;
  width: 20%;
  background-color: #b9b9b9;
  color: black;
  border-radius: 0.3em;
  user-select: none;
  text-align: center;
}

.note-clear-btn:hover {
  background-color: #c4c4c4;
}

.note-cancel-btn {
  position: absolute;
  top: 3.9em;
  left: 0;
  height: 3.6em;
  line-height: 3.6em;
  padding: 0;
  width: 39%;
  background-color: #b9b9b9;
  color: black;
  border-radius: 0.3em;
  user-select: none;
  text-align: center;
}

.note-cancel-btn:hover {
  background-color: #c4c4c4;
}

.status-holder {
  overflow-y: auto;
  max-height: 60vh;
}

.statusrow {
  padding: 1em 4em 1em 1em;
  background-color: #e0e0e0;
  margin: 0.3em;
  text-align: right;
  position: relative;
  user-select: none;
}

.statusrow:hover {
  background-color: #f1f1f1;
}

.statusrow-on {
  outline: 2px solid #00ab6a;
}

.statusrow-circle {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0.8em;
  width: 1.5em;
  height: 1.5em;
  margin: auto;
  border: 1px solid #6f6f6f;
  background-color: #3f3f3f;
  border-radius: 50%;
}
/* /USER EDITOR */

/* TEAM POPUP */
.teams-popup {
  position: fixed;
  top: 9em;
  left: 0;
  right: 0;
  margin: 0 auto;
  padding: 1em;
  width: 19em;
  max-height: 60vh;
  overflow-y: auto;
  background-color: #ffffff;
  border-radius: 0.2em;
  box-shadow: 0.3em 0.3em 0em 0em rgba(0, 0, 0, 0.1);
  z-index: 1021;
}

.is-mobile .teams-popup {
  top: 10em;
  width: 80vw;
}

.teams-close {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: black;
  opacity: 0.4;
  z-index: 1020;
}

.teams-title {
  margin: 0;
  color: #7f7f7f;
  text-align: center;
  font-weight: 600;
}

.user-autocomplete-holder {
  margin: 0 0 2em 0;
}

.teams-ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  border-radius: 0.3em;
  max-height: 60vh;
  overflow-y: auto;
}

.teams-li {
  margin: 1px 0;
  padding: 0.6em 0.8em;
  background-color: #e0e0e0;
  user-select: none;
}

.teams-li:hover {
  background-color: #f1f1f1;
}

.teams-li-on {
  background-color: #00ab6a;
  color: #ffffff;
}

.teams-li-on:hover {
  background-color: #02c97c;
}
/* /TEAM POPUP */

/* CIRCLE BUTTONS */
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
  background-image: url('/icons/team.svg');
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

.circle-btn-icons {
  left: 1em;
  right: auto;
  background-image: url('/icons/layers.svg');
}

.circle-btn-icons .c-tip {
  transform: translateX(0.2em);
}

.circle-btn-list {
  left: 1em;
  right: auto;
  background-image: url('/icons/list.svg');
}

.circle-btn-list .c-tip {
  transform: translateX(-0.1em);
}
/* /CIRCLE BUTTONS */
</style>
