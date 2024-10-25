<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="history-holder">
    <div class="history-title">RECENTLY CREATED CLIENTS:</div>
    <div v-if="loading" class="spinner spinner-local"></div>
    <ul v-if="historyClients.length" class="hislist-ul">
      <li v-for="historyClient in historyClients" :key="historyClient._id" class="hislist-li">
        {{ displayDate(historyClient.created) }}
        &bull;
        {{ historyClient.name }}
        <RouterLink :to="'/clients/view/' + historyClient._id" class="btn">VIEW</RouterLink>
      </li>
    </ul>
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
const historyClients = ref([]);

onMounted(() => {
  loadClients();
});

async function loadClients() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('clientHistory');
    historyClients.value = res;
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
.history-holder {
  width: 64em;
}

.is-mobile .history-holder {
  width: auto;
}

.history-title {
  color: #1f1f1f;
  border-bottom: 1px dashed #9c9c9c;
  margin: 1em 0;
}

.hislist-ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.hislist-li {
  margin: 0;
  padding: 0.4em 0;
  border-bottom: 1px solid #d6d6d6;
  color: #1f1f1f;
  position: relative;
}

.btn {
  padding: 0.2em 0.4em;
  margin: 0 0 0 0.4em;
}

.spinner-local {
  width: 2em;
  height: 2em;
}
</style>
