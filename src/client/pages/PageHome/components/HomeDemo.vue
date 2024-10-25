<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="demo-holder">
    You are viewing Tuumik in a demo environment. We have populated this account with automatically generated sample data to help you assess its features. This includes an organization with
    some user accounts that showcases a law firm with lawyers tracking their work. Please feel free to look around and try out Tuumik's features. This demo environment is meant to be fully
    disposable - the demo accounts will be automatically deleted after a few days.
    <div class="account-holder">
      You are currently logged into the following demo account:
      <div>Name: {{ generalStore.user.name }}</div>
      <div v-if="generalStore.user.emails.length">Email: {{ generalStore.user.emails[0].address }}</div>
      <div>Password: demo</div>
    </div>
  </div>
</template>

<script setup>
import { useGeneralStore } from '/src/client/stores/general.js';
const generalStore = useGeneralStore();
</script>

<style scoped>
.demo-holder {
  background-color: #ffffff;
  color: #1f1f1f;
  padding: 2em;
  margin: 0 0 2em 0;
  box-shadow: 0.1em 0.1em 0.2em 0.2em rgba(0, 0, 0, 0.1);
  border-radius: 0.2em;
}

.account-holder {
  font-weight: 600;
  margin: 2em 0 0 0;
}
</style>
