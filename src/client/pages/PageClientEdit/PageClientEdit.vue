<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <div v-if="loading" class="spinner spinner-global"></div>
    <h1 v-if="!client">Not found</h1>
    <div v-else>
      <h1>{{ client.name }}</h1>
      <form class="main-pane" @submit.prevent="clientSave()">
        <div class="section-title">GENERAL</div>
        <label for="client-name" class="field-label">CLIENT NAME:</label>
        <input id="client-name" v-model="client.name" placeholder="CLIENT NAME" type="text" maxlength="500" />
        <label for="client-reminder" class="field-label">REMINDER:</label>
        <input id="client-reminder" v-model="client.reminder" placeholder="REMINDER" type="text" maxlength="500" />
        <div class="section-title">CONTACT DATA</div>
        <label for="tel" class="field-label">TELEPHONE:</label>
        <input v-model="client.tel" type="text" placeholder="TELEPHONE" class="main-inp" />
        <label for="email" class="field-label">EMAIL:</label>
        <input v-model="client.email" type="text" placeholder="EMAIL" class="main-inp" />
        <label for="address" class="field-label">ADDRESS:</label>
        <textarea v-model="client.address" rows="4" maxlength="2000" placeholder="ADDRESS" class="main-inp"></textarea>
        <input type="submit" value="SAVE CHANGES" class="btn-submit" />
        <div class="section-title deletion-sec">DELETION</div>
        <span class="btn" @click="clientDelete()">
          DELETE CLIENT
        </span>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';

const router = useRouter();
const route = useRoute();
const notifierStore = useNotifierStore();

const loading = ref(false);
const client = ref(null);

onMounted(() => {
  clientLoad();
});

async function clientLoad() {
  loading.value = true;
  const clientId = route.params.clientId;
  try {
    const res = await Meteor.callAsync('getClientForEdit', clientId);
    client.value = res.client;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function clientSave() {
  loading.value = true;
  try {
    await Meteor.callAsync('clientSave', client.value);
    notifierStore.addTemp({ type: 'success', txt: 'CLIENT SAVED' });
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function clientDelete() {
  loading.value = true;
  const clientId = client.value._id;
  try {
    await Meteor.callAsync('clientDelete', clientId);
    notifierStore.addTemp({ type: 'success', txt: 'CLIENT DELETED' });
    router.push('/assets');
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}
</script>

<style scoped>
.deletion-sec {
  margin: 9em 0 1em 0;
}
</style>
