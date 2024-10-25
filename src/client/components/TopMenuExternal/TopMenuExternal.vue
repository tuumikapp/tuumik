<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="header-external">
    <div class="spacer"></div>
    <div v-if="generalStore.user" class="menu-right">
      <RouterLink to="/overview" class="mlink">BACK TO APP</RouterLink>
    </div>
    <div v-else class="menu-right">
      <RouterLink to="/login" class="mlink">
        LOG IN
      </RouterLink>
      <RouterLink v-if="!generalStore.settings.demoMode" to="/signup" class="mlink">
        SIGN UP
      </RouterLink>
      <RouterLink v-if="generalStore.settings.demoMode" to="/start-demo" class="mlink">
        START DEMO
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { useGeneralStore } from '/src/client/stores/general.js';

const generalStore = useGeneralStore();
</script>

<style scoped>
.header-external {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3em;
  z-index: 1000;
  background-color: #00ab6a;
  border-bottom: 1px solid #00c076;
  color: #eeeeee;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.menu-right {
  display: flex;
  margin: 0;
  padding: 0 2em;
  list-style-type: none;
}

.mlink {
  padding: 0 0.6em;
  line-height: 3em;
  display: inline-block;
  border-radius: 0.3em;
}

.mlink:hover {
  color: #ffffff;
}

.router-link-active {
  text-decoration: underline;
}

.spacer {
  margin-left: auto;
}
</style>
