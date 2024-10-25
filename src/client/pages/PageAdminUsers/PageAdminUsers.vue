<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <h1>User Accounts ({{ listUsers.length }})</h1>
    <RouterLink to="/admin/users/add" class="btn-submit btn-new-user">
      CREATE NEW USER
    </RouterLink>
    <table v-if="listUsers.length" class="userstable">
      <tr>
        <th class="uth">Name</th>
        <th class="uth">Username</th>
        <th class="uth">Email</th>
        <th class="uth">Created</th>
        <th class="uth">Status*</th>
        <th class="uth">Edit</th>
      </tr>
      <tr v-for="listUser in listUsers" :key="listUser._id" :class="{ 'disabled-user': listUser.disabled }" class="utr">
        <td class="utd">{{ listUser.name }}</td>
        <td class="utd td-username">
          <span v-if="listUser.username">{{ listUser.username }}</span>
          <span v-else>-</span>
        </td>
        <td class="utd td-email">
          <div v-for="email in listUser.emails" :key="email.address">
            <div>{{ email.address }}</div>
            <div v-if="email.verified" class="email-verified">VERIFIED</div>
            <div v-else class="email-unverified">NOT VERIFIED</div>
          </div>
        </td>
        <td class="utd td-created">{{ displayDate(listUser.created) }}</td>
        <td class="utd td-disabled">
          <span v-if="listUser.disabled">DISABLED</span>
          <span v-else class="active-user">ACTIVE</span>
        </td>
        <td class="utd td-edit">
          <RouterLink :to="'/admin/users/edit/' + listUser._id" class="btn">EDIT</RouterLink>
        </td>
      </tr>
    </table>

    <div class="billing-explanation">
      * User accounts that are disabled are not subject to billing. These only exist for archival purposes.
      If a user account is reactivated, it will again take up a seat in your subscription.
    </div>
    <div v-if="loading" class="spinner spinner-global"></div>
    <div v-if="!loading && !listUsers.length" class="no-results">NO RESULTS</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();

const loading = ref(false);
const listUsers = ref([]);

onMounted(() => {
  usersLoad();
});

async function usersLoad() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('usersList');
    listUsers.value = res;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function displayDate(date, notUtc, customFormat) {
  const format = customFormat || generalStore.tenant.dateFormat;
  return !notUtc ? dayjs.utc(date).format(format) : dayjs(date).format(format);
}
</script>

<style scoped>
.btn-new-user {
  padding: 1em 2em;
  margin-bottom: 2em;
  color: white;
}

.no-results {
  padding: 1em;
  text-align: center;
  border-top: 1px solid #3d3d3d;
  color: #eeeeee;
}

.add-user {
  color: #ffea8a;
}

.userstable {
  width: 100%;
  border-collapse: collapse;
  color: #1f1f1f;
}

.utr:hover {
  background-color: #f3f3f3;
}

.uth {
  border: 1px solid #cecece;
  padding: 1.4em 0.9em;
  text-align: left;
  font-weight: 600;
}

.utd {
  border: 1px solid #cecece;
  padding: 0.9em 0.9em;
  vertical-align: top;
}

.td-username {
  width: 10em;
}

.td-email {
  width: 20em;
}

.td-created {
  width: 6em;
}

.td-edit {
  width: 5em;
  text-align: center;
  padding: 0.2em 0.4em;
}

.td-disabled {
  width: 6em;
}

.active-user {
  color: #009900;
}

.disabled-user {
  background-color: #dbdbdb;
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

.billing-explanation {
  font-weight: 600;
  margin: 2em 0 0 0;
}
</style>
