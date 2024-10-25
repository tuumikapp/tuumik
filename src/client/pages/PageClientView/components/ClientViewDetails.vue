<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <span class="title">Details</span>
    <table v-if="client" class="details-table">
      <tr class="htr">
        <td class="htd htd-title">Name</td>
        <td class="htd htd-content">{{ client.name }}</td>
      </tr>
      <tr class="htr">
        <td class="htd htd-title">Reminder</td>
        <td class="htd htd-content">{{ client.reminder }}</td>
      </tr>
      <tr class="htr">
        <td class="htd htd-title">Created</td>
        <td class="htd htd-content">{{ displayDate(client.created) }}</td>
      </tr>
    </table>

    <div v-if="loading" class="spinner spinner-local"></div>
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

const props = defineProps({
  clientId: { type: String, required: true },
});

const loading = ref(false);
const client = ref(null);

onMounted(() => {
  clientLoad();
});

async function clientLoad() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('getClientForView', props.clientId);
    client.value = res.client;
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
.title {
  background-color: #ffffff;
  padding: 0.4em 0.9em;
  display: inline-block;
  margin: 2em 0 0 0;
  border-radius: 0.2em 0.2em 0 0;
}

.spinner-local {
  width: 2em;
  height: 2em;
  margin: 1em;
}

.no-results {
  padding: 1em;
  text-align: center;
  border-top: 1px solid #cecece;
}

.details-table {
  width: 100%;
  margin: 0;
  padding: 0;
  border-collapse: collapse;
}

.htr {
  margin: 0;
  padding: 0.2em 0.2em 0.2em 1.4em;
}

.htd {
  background-color: #ffffff;
  border: 1px solid #cecece;
  padding: 0.2em 0.4em;
  vertical-align: top;
}

.htd-title {
  width: 6em;
}

.htd-content {
  color: #1f1f1f;
}
</style>
