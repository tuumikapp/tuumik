<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <div v-if="loading" class="spinner spinner-global"></div>
    <div v-if="!editedUser">
      <h1>No user found</h1>
    </div>
    <div v-else>
      <h1>Edit user: {{ editedUser.name }}</h1>
      <form class="main-pane" @submit.prevent="saveUserGeneral1()">
        <label for="name" class="field-label">NAME:</label>
        <input id="name" v-model="editedUser.name" type="text" maxlength="50" />
        <label for="pic" class="field-label">PROFILE PICTURE:</label>
        <input id="pic" v-model="editedUser.pic" type="text" maxlength="150" />
        <div class="field-tip">Recommended: 500x500px JPG or PNG.</div>
        <label class="field-label">PERMISSIONS:</label>
        <div class="chk-holder-hori">
          <label class="chk-label">
            <input v-model="editedUser.permissions.timeTracker" type="checkbox" />
            <span>TIME TRACKER</span>
          </label>
          <label class="chk-label">
            <input v-model="editedUser.permissions.historyOthers" type="checkbox" />
            <span>TASK HISTORY</span>
          </label>
          <label class="chk-label">
            <input v-model="editedUser.permissions.monitor" type="checkbox" />
            <span>MONITOR</span>
          </label>
          <label class="chk-label">
            <input v-model="editedUser.permissions.clientsEdit" type="checkbox" />
            <span>EDIT CLIENTS</span>
          </label>
          <label class="chk-label">
            <input v-model="editedUser.permissions.projectsEdit" type="checkbox" />
            <span>EDIT PROJECTS</span>
          </label>
          <label class="chk-label">
            <input v-model="editedUser.permissions.catalog" type="checkbox" />
            <span>CATALOG</span>
          </label>
          <label class="chk-label">
            <input v-model="editedUser.permissions.composer" type="checkbox" />
            <span>TIMESHEET EXPLORER</span>
          </label>
          <label class="chk-label">
            <input v-model="editedUser.permissions.inOutSelf" type="checkbox" />
            <span>IN/OUT SELF EDITOR</span>
          </label>
          <label class="chk-label">
            <input v-model="editedUser.permissions.inOutView" type="checkbox" />
            <span>IN/OUT LIST VIEW</span>
          </label>
          <label class="chk-label">
            <input v-model="editedUser.permissions.inOutEditOthers" type="checkbox" />
            <span>IN/OUT LIST EDIT</span>
          </label>
          <label class="chk-label">
            <input v-model="editedUser.permissions.admin" type="checkbox" />
            <span>ADMIN PANEL</span>
          </label>
        </div>
        <div class="section-title">TIME TRACKER</div>
        <label class="field-label">SIMPLE TRACKER:</label>
        <label class="single-checkbox-label">
          <input v-model="editedUser.trackerSimple" type="checkbox" />
          <span>ENABLED</span>
        </label>
        <label class="field-label">DEFAULT CLIENT:</label>
        <AutoComplete ac-type="clients" hint="CLIENTS" clear-after @autocomplete-pick="selectAcClient($event)" />
        <div v-if="editedUser.defaultClientId" class="default-name">
          {{ editedUser.defaultClientName }}
          <div class="default-clear" @click="clearDefaultClient()"></div>
        </div>
        <div v-else class="default-name">-</div>
        <label class="field-label">DEFAULT PROJECT (ALSO SETS CLIENT):</label>
        <AutoComplete ac-type="projects" hint="PROJECTS" clear-after @autocomplete-pick="selectAcProject($event)" />
        <div v-if="editedUser.defaultProjectId" class="default-name">
          {{ editedUser.defaultProjectName }}
          <div class="default-clear" @click="clearDefaultProject()"></div>
        </div>
        <div v-else class="default-name">-</div>
        <div class="section-title">IN/OUT BOARD</div>
        <label class="field-label">SHOW ON IN/OUT BOARD:</label>
        <label class="single-checkbox-label">
          <input v-model="editedUser.inOutShow" type="checkbox" />
          <span>ENABLED</span>
        </label>
        <label class="field-label">TEAMS:</label>
        <div class="chk-holder-hori">
          <label v-for="team in generalStore.tenant.teams" :key="team.id" class="chk-label">
            <input v-model="editedUser.inTeams" type="checkbox" :value="team.id" />
            <span>{{ team.name }}</span>
          </label>
          <span v-if="!generalStore.tenant.teams.length">No teams found.</span>
        </div>
        <input type="submit" value="SAVE CHANGES" class="btn-submit" />
      </form>
      <form class="main-pane" @submit.prevent="saveUserUsername1()">
        <label for="username" class="field-label">USERNAME:</label>
        <input id="username" v-model="editedUser.username" type="text" maxlength="50" />
        <input type="submit" value="CHANGE USERNAME" class="btn-submit" />
      </form>
      <form class="main-pane" @submit.prevent="saveUserPassword1()">
        <label for="password" class="field-label">PASSWORD:</label>
        <input id="password" v-model="password" type="text" maxlength="50" />
        <div class="field-tip">At least 1 upper case, 1 lower case, 1 number. At least 8 characters.</div>
        <input type="submit" value="CHANGE PASSWORD" class="btn-submit" />
      </form>
      <form class="main-pane" @submit.prevent="addUserEmail1()">
        <label for="email" class="field-label">EMAIL ADDRESS:</label>
        <input id="email" v-model="newEmail" type="text" maxlength="100" />
        <input type="submit" value="ADD EMAIL ADDRESS" class="btn-submit" />
        <div v-for="email in editedUser.emails" :key="email.address" class="email-row">
          <div class="email-address">{{ email.address }}</div>
          <div v-if="email.verified" class="email-verified">VERIFIED</div>
          <div v-else class="email-unverified">NOT VERIFIED</div>
          <div v-if="!email.verified" class="btn" @click="sendVerifyEmail(email.address)">SEND VERIFICATION EMAIL</div>
          <div class="btn" @click="removeUserEmail(email.address)">REMOVE</div>
        </div>
      </form>
      <div class="main-pane">
        <div v-if="!editedUser.disabled" class="status-box">STATUS: ACTIVE</div>
        <div v-else class="status-box status-disabled">STATUS: DEACTIVATED. USER CANNOT LOG IN</div>
        <span v-if="!editedUser.disabled" class="btn" @click="disableUser()">DEACTIVATE USER</span>
        <span v-else class="btn" @click="enableUser()">ACTIVATE USER</span>
      </div>
      <div class="main-pane">
        <span class="btn" @click="removeUser()">DELETE USER</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import AutoComplete from '/src/client/components/AutoComplete/AutoComplete.vue';
import { isValidEmailAddress, isValidPasswordStrength } from '/src/client/utils/validation';
import { hashPassword } from '/src/client/utils/accounts';

const router = useRouter();
const route = useRoute();
const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();

const loading = ref(false);
const editedUser = ref(null);
const newEmail = ref('');
const password = ref('');

onMounted(() => {
  loadUser();
});

async function loadUser() {
  loading.value = true;
  const userId = route.params.userId;
  try {
    const res = await Meteor.callAsync('getUserForEdit', userId);
    editedUser.value = res.editedUser;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function saveUserGeneral1() {
  if (!editedUser.value.name) {
    notifierStore.addTemp({ type: 'error', txt: 'PLEASE FILL NAME FIELD' });
  } else {
    saveUserGeneral2();
  }
}

async function saveUserGeneral2() {
  loading.value = true;
  try {
    await Meteor.callAsync('saveUserGeneral', editedUser.value);
    notifierStore.addTemp({ type: 'success', txt: 'CHANGES SAVED' });
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function selectAcClient(result) {
  editedUser.value.defaultClientId = result._id;
  editedUser.value.defaultClientName = result.name;
  clearDefaultProject();
}

function selectAcProject(result) {
  editedUser.value.defaultProjectId = result._id;
  editedUser.value.defaultProjectName = result.name;
  clearDefaultClient();
}

function clearDefaultClient() {
  editedUser.value.defaultClientId = '';
  editedUser.value.defaultClientName = '';
}

function clearDefaultProject() {
  editedUser.value.defaultProjectId = '';
  editedUser.value.defaultProjectName = '';
}

function saveUserUsername1() {
  if (!editedUser.value.username) {
    notifierStore.addTemp({ type: 'error', txt: 'PLEASE FILL USERNAME FIELD' });
  } else {
    saveUserUsername2();
  }
}

async function saveUserUsername2() {
  loading.value = true;
  const userId = editedUser.value._id;
  const username = editedUser.value.username;
  try {
    await Meteor.callAsync('saveUserUsername', userId, username);
    notifierStore.addTemp({ type: 'success', txt: 'USERNAME SAVED' });
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function saveUserPassword1() {
  if (!isValidPasswordStrength(password.value)) {
    notifierStore.addTemp({ type: 'error', txt: 'INSUFFICIENT PASSWORD STRENGTH' });
  } else {
    saveUserPassword2();
  }
}

async function saveUserPassword2() {
  loading.value = true;
  const userId = editedUser.value._id;
  const password2 = hashPassword(password.value);
  try {
    await Meteor.callAsync('saveUserPassword', userId, password2);
    notifierStore.addTemp({ type: 'success', txt: 'PASSWORD SAVED' });
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function addUserEmail1() {
  if (!isValidEmailAddress(newEmail.value)) {
    notifierStore.addTemp({ type: 'error', txt: 'INVALID EMAIL ADDRESS' });
  } else {
    addUserEmail2();
  }
}

async function addUserEmail2() {
  loading.value = true;
  const userId = editedUser.value._id;
  try {
    await Meteor.callAsync('addUserEmail', userId, newEmail.value);
    notifierStore.addTemp({ type: 'success', txt: 'EMAIL ADDRESS SAVED' });
    loading.value = false;
    loadUser();
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
    loadUser();
  }
}

async function removeUserEmail(email) {
  loading.value = true;
  const userId = editedUser.value._id;
  try {
    await Meteor.callAsync('removeUserEmail', userId, email);
    notifierStore.addTemp({ type: 'success', txt: 'EMAIL ADDRESS REMOVED' });
    loading.value = false;
    loadUser();
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
    loadUser();
  }
}

async function sendVerifyEmail(email) {
  loading.value = true;
  const userId = editedUser.value._id;
  try {
    await Meteor.callAsync('sendVerifyEmail', userId, email);
    notifierStore.addTemp({ type: 'success', txt: `VERIFICATION EMAIL SENT: ${email}` });
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function disableUser() {
  loading.value = true;
  const userId = editedUser.value._id;
  try {
    await Meteor.callAsync('disableUser', userId);
    notifierStore.addTemp({ type: 'success', txt: 'ACCOUNT DISABLED' });
    editedUser.value.disabled = true;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function enableUser() {
  loading.value = true;
  const userId = editedUser.value._id;
  try {
    await Meteor.callAsync('enableUser', userId);
    notifierStore.addTemp({ type: 'success', txt: 'ACCOUNT ENABLED' });
    editedUser.value.disabled = false;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function removeUser() {
  loading.value = true;
  const userId = editedUser.value._id;
  try {
    await Meteor.callAsync('removeUser', userId);
    notifierStore.addTemp({ type: 'success', txt: 'ACCOUNT DELETED' });
    router.push('/admin/users/list');
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}
</script>

<style scoped>
.divider {
  width: 62em;
  height: 0;
  margin: 1em 0;
  border-bottom: 1px dashed #2d2d2d;
}

.default-name {
  position: relative;
  padding: 0.4em 4em 0.4em 0.6em;
  border: 1px solid #cecece;
  border-radius: 0 0 0.3em 0.3em;
}

.default-clear {
  position: absolute;
  top: -1px;
  bottom: -1px;
  right: -1px;
  width: 3.5em;
  border-radius: 0 0.3em 0.3em 0;
  background-color: #7f7f7f;
  background-image: url('/icons/close-light.svg');
  background-repeat: no-repeat;
  background-size: 30% auto;
  background-position: center center;
}

.email-row {
  background-color: #e4e4e4;
  border-radius: 0.3em;
  padding: 0.6em;
  margin: 1em 0 0 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.email-address {
  margin: 0 auto 0 0;
}

.email-verified {
  background-color: #7ce478;
  border-radius: 0.3em;
  padding: 0.2em 0.4em;
  display: inline-block;
}

.email-unverified {
  background-color: #9f9f9f;
  border-radius: 0.3em;
  padding: 0.2em 0.4em;
  display: inline-block;
}

.email-row .btn {
  margin-left: 1em;
}

.status-box {
  padding: 1em 0.6em;
  background-color: #5bc746;
  margin: 0 0 1em 0;
  border-radius: 0.3em;
}

.status-disabled {
  background-color: #9e9e9e;
}
</style>
