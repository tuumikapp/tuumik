<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <HomeDemo v-if="generalStore.settings.demoMode" />
    <HomeChartTotals />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useRouter } from 'vue-router';
import HomeDemo from './components/HomeDemo.vue';
import HomeChartTotals from './components/HomeChartTotals.vue';

const generalStore = useGeneralStore();
const router = useRouter();

onMounted(() => {
  if (generalStore.tenant.homeView === 'inOut') router.push('inout');
});
</script>

<style scoped>
.home-holder {
  background-color: #3d3d3d;
  color: limegreen;
  padding: 2em;
}
</style>
