<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div :class="{ 'menu-mobile-on': showMenuMob }" class="menu-mobile" @click="$emit('close-menu')">
    <div class="menu-mobile-closer"></div>
    <div class="column-title">GENERAL</div>
    <RouterLink v-if="perms.timeTracker" :to="'/day'" class="menu-item">Track Time</RouterLink>
    <RouterLink v-if="perms.inOutView" :to="'/inout'" class="menu-item">In/Out Board</RouterLink>
    <RouterLink v-if="perms.monitor" :to="'/teammonitor'" class="menu-item">Team Monitor</RouterLink>
    <RouterLink :to="'/usermonitor'" class="menu-item">User Monitor</RouterLink>
    <RouterLink v-if="perms.catalog" :to="'/assets'" class="menu-item">Clients & Projects</RouterLink>
    <RouterLink v-if="perms.timeTracker" :to="'/recent'" class="menu-item">My Recent Tasks</RouterLink>
    <div class="column-title title-marg">ACCOUNT</div>
    <RouterLink :to="'/logout'" class="menu-item"> Log out ({{ generalStore.user.name }}) </RouterLink>
    <RouterLink :to="'/settings'" class="menu-item">Account Settings</RouterLink>
    <RouterLink :to="'/install'" class="menu-item">Install App</RouterLink>
    <RouterLink :to="'/about'" class="menu-item">About</RouterLink>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';

const generalStore = useGeneralStore();

const props = defineProps({
  showMenuMob: { type: Boolean, required: true },
});

const perms = computed(() => {
  return generalStore?.user?.permissions || {};
});
</script>

<style scoped>
.menu-mobile {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 20vw;
  right: 0;
  padding: 0 0 3em 0;
  background-color: white;
  overflow-y: auto;
  border-radius: 0.9em 0 0 0;
  box-shadow: 0.1em 0.1em 0.4em 0.4em rgba(0, 0, 0, 0.1);
  z-index: 10000;
  transform: translateX(120vw);
  transition: transform 300ms ease;
}

.menu-mobile-on {
  transform: translateX(0);
}

.menu-mobile-closer {
  margin: 0.7em 0 0 auto;
  padding: 0 1.4em;
  height: 3em;
  width: 3em;
  background-image: url('/icons/close-dark.svg');
  background-repeat: no-repeat;
  background-size: auto 80%;
  background-position: center center;
}

.column-title {
  border-bottom: 1px solid #e0e0e0;
  padding: 0 0 0 1em;
  color: #9e9e9e;
  font-size: 1.2em;
}

.title-marg {
  margin: 3em 0 0 0;
}

.menu-item {
  margin: 0.3em 0;
  padding: 1em 1em 1em 1em;
  font-size: 1.2em;
  display: block;
}

.menu-mobile .router-link-active {
  font-weight: 600;
  background-color: #e9e9e9;
}
</style>
