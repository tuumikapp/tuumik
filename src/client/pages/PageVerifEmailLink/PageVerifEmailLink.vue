<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <div v-if="loading" class="spinner spinner-global"></div>
    <div v-else-if="err" class="err">
      Email address verification not successful. This is likely because you have already verified your email address.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Accounts } from 'meteor/accounts-base';

const router = useRouter();
const route = useRoute();
const notifierStore = useNotifierStore();

const loading = ref(false);

onMounted(() => {
  verifyEmail();
});

function verifyEmail() {
  loading.value = true;
  const token = route.params.token;
  Accounts.verifyEmail(token, err => {
    if (err) {
      notifierStore.addTemp({ type: 'error', txt: err.reason });
      loading.value = false;
    } else {
      notifierStore.addTemp({ type: 'success', txt: 'EMAIL ADDRESS VERIFIED. YOU ARE LOGGED IN' });
      router.push('/'); // pushing away from this page to prevent verifyEmail from running twice due to automatic login on success
      loading.value = false;
    }
  });
}
</script>
