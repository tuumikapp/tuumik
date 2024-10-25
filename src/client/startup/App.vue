<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div :class="{ 'is-mobile': generalStore.isMobile }">
    <TopMenu v-if="generalStore.user && !route.meta.noTopMenu && !route.meta.topMenuExternal" :style="{ fontSize: fontSize }" />
    <TopMenuExternal v-else-if="route.meta.topMenuExternal" :style="{ fontSize: fontSize }" />
    <BottomMenuExternal v-if="route.meta.bottomMenuExternal" :style="{ fontSize: fontSize }" />
    <div v-if="generalStore.userId && (!generalStore.user || !generalStore.tenant)" class="spinner spinner-global"></div>
    <LacksPermission v-else-if="generalStore.userId && lacksPermission" />
    <RouterView v-else :style="{ fontSize: fontSize, marginTop: marginTopBody, padding: paddingBody }" />
    <SubUser />
    <SubTenant v-if="generalStore.user" />
    <GlobalNotifier v-if="notifierStore.messages.length" :style="{ fontSize: fontSize }" />
  </div>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import SubUser from '/src/client/components/SubUser.vue';
import SubTenant from '/src/client/components/SubTenant.vue';
import GlobalNotifier from '/src/client/components/GlobalNotifier/GlobalNotifier.vue';
import TopMenu from '/src/client/components/TopMenu/TopMenu.vue';
import TopMenuExternal from '/src/client/components/TopMenuExternal/TopMenuExternal.vue';
import BottomMenuExternal from '/src/client/components/BottomMenuExternal/BottomMenuExternal.vue';
import LacksPermission from '/src/client/components/LacksPermission/LacksPermission.vue';

const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();
const route = useRoute();

const fontSize = computed(() => {
  return `${generalStore.zoomBody}px`;
});

const paddingBody = computed(() => {
  const padding = generalStore.isMobile ? '2em 0.6em' : '2em';
  return route.meta.noPadding ? '0' : padding;
});

const lacksPermission = computed(() => {
  const reqPerm = route.meta.requirePermission;
  if (!reqPerm || generalStore.user.permissions[reqPerm]) return false;
  return true;
});

const marginTopBody = computed(() => {
  if (route.meta.secondTopMenu && !route.meta.noTopMenu) return `${generalStore.zoomBody * (3 + route.meta.secondTopMenu)}px`;
  if (!route.meta.noTopMenu) return `${generalStore.zoomBody * 3}px`;
  return '0px';
});

watch(route, (to, from) => {
  if (to.meta.external) {
    document.body.classList.add('body-external');
  } else {
    document.body.classList.remove('body-external');
  }
}, { immediate: true });

onMounted(() => {
  window.addEventListener('beforeinstallprompt', event => {
    generalStore.pwaBeforeInstall = event;
  });
  document.addEventListener('resume', () => {
    Meteor.reconnect();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') Meteor.reconnect();
  });
  document.addEventListener('freeze', () => {
    Meteor.disconnect();
  });

  // set isMobile
  const mediaQuery = '(max-width: 700px)';
  const mediaQueryList = window.matchMedia(mediaQuery);
  mediaQueryList.addEventListener('change', event => {
    generalStore.isMobile = event.matches;
  });
  const initValue = window.matchMedia(mediaQuery).matches;
  generalStore.isMobile = initValue;
  // /set isMobile
});

Tracker.autorun(() => {
  generalStore.userId = Meteor.userId();
});
</script>
