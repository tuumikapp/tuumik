<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="menu-holder" @click="$emit('close-menu')">
    <div class="menu-closer"></div>
    <div class="menu-column">
      <div class="column-title">GENERAL</div>
      <RouterLink v-if="perms.timeTracker" :to="'/day'" class="menu-item">Track Time</RouterLink>
      <RouterLink v-if="perms.inOutView" :to="'/inout'" class="menu-item">In/Out Board</RouterLink>
      <RouterLink v-if="perms.monitor" :to="'/teammonitor'" class="menu-item">Team Monitor</RouterLink>
      <RouterLink :to="'/usermonitor'" class="menu-item">User Monitor</RouterLink>
      <RouterLink v-if="perms.composer" :to="'/explorer'" class="menu-item">Timesheet Explorer</RouterLink>
      <RouterLink v-if="perms.catalog" :to="'/assets'" class="menu-item">Clients & Projects</RouterLink>
      <RouterLink v-if="perms.timeTracker" :to="'/recent'" class="menu-item">My Recent Tasks</RouterLink>
    </div>
    <div v-if="perms.admin" class="menu-column">
      <div class="column-title">ADMIN</div>
      <RouterLink :to="'/admin/settings'" class="menu-item">General Settings</RouterLink>
      <RouterLink :to="'/admin/users/list'" class="menu-item">User Accounts</RouterLink>
      <RouterLink :to="'/admin/teams'" class="menu-item">Teams</RouterLink>
      <RouterLink :to="'/admin/exporters'" class="menu-item">Exporters</RouterLink>
      <RouterLink :to="'/admin/inoutoptions'" class="menu-item">In/Out Options</RouterLink>
      <RouterLink :to="'/admin/taskgroups'" class="menu-item">Task Groups</RouterLink>
      <RouterLink v-if="!generalStore.settings.demoMode" :to="'/admin/subscriptions'" class="menu-item">Subscriptions & Billing</RouterLink>
    </div>
    <div class="menu-column">
      <div class="column-title">ACCOUNT</div>
      <RouterLink :to="'/logout'" class="menu-item"> Log out ({{ generalStore.user.name }}) </RouterLink>
      <RouterLink :to="'/settings'" class="menu-item">Account Settings</RouterLink>
      <RouterLink :to="'/install'" class="menu-item">Install App</RouterLink>
      <RouterLink :to="'/about'" class="menu-item">About</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';

const generalStore = useGeneralStore();

const perms = computed(() => {
  return generalStore?.user?.permissions || {};
});
</script>

<style scoped>
.menu-holder {
  position: fixed;
  top: 3.2em;
  left: 4em;
  max-height: 70vh;
  overflow-y: auto;
  background-color: #ffffff;
  color: #1f1f1f;
  padding: 1em;
  border: 1px solid #c7c7c7;
  box-shadow: 0.1em 0.1em 0.2em 0.2em rgba(0, 0, 0, 0.1);
  border-radius: 0.2em;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.menu-closer {
  position: absolute;
  top: 1em;
  right: 0;
  padding: 0 1.4em;
  height: 3em;
  width: 3em;
  background-image: url('/icons/close-dark.svg');
  background-repeat: no-repeat;
  background-size: auto 80%;
  background-position: center center;
  cursor: pointer;
}

.menu-column {
  width: 16em;
  margin: 0 0.5em;
}

.column-title {
  border-bottom: 1px solid #e0e0e0;
  margin: 3em 0 0 1.2em;
  color: #9e9e9e;
}

.menu-item {
  margin: 0.3em 0;
  padding: 1em 1em 1em 1em;
  display: block;
}

.menu-item:hover {
  background-color: #f3f3f3;
}

.menu-holder .router-link-active {
  font-weight: 600;
  background-color: #e9e9e9;
}
</style>
