<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="header">
    <RouterLink v-if="!generalStore.isMobile" to="/" class="logo"></RouterLink>
    <div v-if="!generalStore.isMobile" :class="{ 'menu-reg-icon-on': showMenuReg }" class="menu-reg-icon" @click="showMenuReg = !showMenuReg">
      MENU
    </div>
    <div v-if="showMenuReg" class="menu-closer" @click="showMenuReg = false"></div>
    <div class="spacer"></div>
    <IconConnection />
    <IconInOut v-if="generalStore.user && generalStore.tenant && generalStore.user.permissions.inOutSelf" />
    <IconZoom />
    <div v-if="generalStore.isMobile" class="menu-mob-icon" @click="showMenuMob = true"></div>
    <MenuDesk v-if="showMenuReg" @close-menu="showMenuReg = false" />
    <MenuMobile v-if="generalStore.isMobile" :show-menu-mob="showMenuMob" @close-menu="showMenuMob = false" />
    <div v-if="showMenuMob" class="menu-closer" @click="showMenuMob = false"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import IconConnection from './components/IconConnection.vue';
import IconInOut from './components/IconInOut.vue';
import IconZoom from './components/IconZoom.vue';
import MenuDesk from './components/MenuDesk.vue';
import MenuMobile from './components/MenuMobile.vue';

const generalStore = useGeneralStore();
const showMenuReg = ref(false);
const showMenuMob = ref(false);
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 3000;
  background-color: #ffffff;
  border-bottom: 1px solid #c9c9c9;
  color: #1f1f1f;
  display: flex;
  align-items: center;
}

.logo {
  height: 3em;
  width: 2em;
  padding: 0 1em;
  background-image: url('/icons/logo.svg');
  background-repeat: no-repeat;
  background-size: auto 60%;
  background-position: center center;
}

.spacer {
  margin-left: auto;
}

.menu-reg-icon {
  height: 3em;
  line-height: 3em;
  padding: 0 2em;
  border-left: 1px solid #c9c9c9;
  border-right: 1px solid #c9c9c9;
  cursor: pointer;
  user-select: none;
}

.menu-reg-icon:hover {
  background-color: #eff3f8;
}

.menu-reg-icon-on {
  background-color: #eff3f8;
}

.menu-mob-icon {
  margin: 0 0.6em;
  height: 3em;
  width: 3em;
  background-image: url('/icons/menu.svg');
  background-repeat: no-repeat;
  background-size: auto 80%;
  background-position: center center;
}

.menu-closer {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
