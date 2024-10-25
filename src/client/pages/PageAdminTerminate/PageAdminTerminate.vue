<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <h1>Terminate Organization</h1>
    <div v-if="generalStore.settings.demoMode" class="main-pane">
      You are viewing Tuumik in a demo environment. This account will be automatically deleted after a while.
    </div>
    <form v-else class="main-pane" @submit.prevent="terminateTenant()">
      <input v-model="password" type="password" placeholder="TENANT DELETION PASSWORD" />
      <div class="field-tip">
        This password is set in your server configuration. Please contact an administrator if you need assistance.
      </div>
      <input type="submit" value="DELETE ORGANIZATION AND ALL ITS DATA" class="btn-submit" />
    </form>
    <div v-if="loading" class="spinner spinner-global"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';

const router = useRouter();
const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();

const loading = ref(false);
const password = ref('');

async function terminateTenant() {
  loading.value = true;
  try {
    await Meteor.callAsync('terminateTenant', password.value);
    notifierStore.addTemp({ type: 'success', txt: 'ORGANIZATION DELETED' });
    router.push('/bye');
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}
</script>

<style scoped>
.warning {
  margin: 0 0 1em 0;
  color: red;
  font-weight: 600;
}

.confirmation {
  color: #f16e6e;
  border: 1px dashed #f16e6e;
  padding: 2em;
  margin: 2em 0;
}

.confirmation-inp {
  margin: 1em 0;
}

.terminate-disabled {
  opacity: 0.4;
}
</style>
