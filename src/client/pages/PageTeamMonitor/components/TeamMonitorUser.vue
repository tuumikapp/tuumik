<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <TeamMonitorVert v-if="dispMode === 'vert'" :target-user="targetUser" :style="vertHolderStyle()" />
    <TeamMonitorText v-else :target-user="targetUser" />
  </div>
</template>

<script setup>
import TeamMonitorVert from './TeamMonitorVert.vue';
import TeamMonitorText from './TeamMonitorText.vue';

const props = defineProps({
  monitorDate: { type: Number, required: true },
  targetUser: { type: Object, required: true },
  dispMode: { type: String, required: true },
  sizeVert: { type: Number, required: true },
});

function vertHolderStyle() {
  return `width: ${props.sizeVert}em;`;
}
</script>
