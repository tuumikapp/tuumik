<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div v-if="!generalStore.isMobile" class="sm-second-menu">
    <span class="sm-btn sm-tip-holder date-prev" @click="datePrev()">
      <span class="sm-tip">PREVIOUS DATE</span>
    </span>
    <span class="sm-btn sm-tip-holder date-next" @click="dateNext()">
      <span class="sm-tip">NEXT DATE</span>
    </span>
    <div class="sm-divider"></div>
    <TimeTrackerDate :tracker-date="trackerDate" />
    <div class="sm-divider"></div>
    <span class="times-total sm-tip-holder">
      {{ times.length }}
      <span class="sm-tip">ENTRIES</span>
    </span>
    <div class="sm-divider"></div>
    <span class="summary-duration sm-tip-holder">
      {{ summaryTimes.duration }}
      <span class="sm-tip">TOTAL TIME</span>
    </span>
    <div class="sm-divider"></div>
    <div class="sm-items-right">
      <TimeTrackerZoom v-if="trackerStore.viewMode === 'visual'" />
    </div>
  </div>
  <div v-else class="sm-second-menu">
    <TimeTrackerDate :tracker-date="trackerDate" />
    <div class="sm-divider"></div>
    <span class="times-total">{{ times.length }}</span>
    <div class="sm-divider"></div>
    <span class="summary-duration">
      {{ summaryTimes.duration }}
    </span>
    <div class="sm-items-right">
      <TimeTrackerZoom v-if="trackerStore.viewMode === 'visual'" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useTrackerStore } from '/src/client/stores/tracker.js';
import dayjs from 'dayjs';
import TimeTrackerDate from './TimeTrackerDate.vue';
import TimeTrackerZoom from './TimeTrackerZoom.vue';
import { minutesToDuration } from '/src/shared/utils/time.js';

const router = useRouter();
const generalStore = useGeneralStore();
const trackerStore = useTrackerStore();

const props = defineProps({
  trackerDate: { type: Number, required: true },
  times: { type: Array, default: [] },
});

const summaryTimes = computed(() => {
  let total = 0;
  let incomplete = 0;
  let durationMinutes = 0;
  for (let i = 0; i < props.times.length; i += 1) {
    total += 1;
    if (!props.times[i].taskDesc || !props.times[i].projectId || (props.times[i].useTaskType && !props.times[i].taskType)) {
      incomplete += 1;
    }
    durationMinutes += props.times[i].endMinute - props.times[i].startMinute;
  }
  const duration = minutesToDuration(durationMinutes);
  return { total, incomplete, duration };
});

function datePrev() {
  const trackerDate = dayjs(props.trackerDate).subtract(1, 'days').format('YYYY-MM-DD');
  router.push({ name: 'timeTracker', params: { trackerDate } });
}

function dateNext() {
  const trackerDate = dayjs(props.trackerDate).add(1, 'days').format('YYYY-MM-DD');
  router.push({ name: 'timeTracker', params: { trackerDate } });
}
</script>

<style scoped>
.date-prev,
.date-next {
  width: 2.5em;
  background-image: url('/icons/arrow-right.svg');
  background-repeat: no-repeat;
  background-size: auto 55%;
  background-position: center center;
  z-index: 1;
}

.date-prev {
  background-image: url('/icons/arrow-left.svg');
}

.times-total {
  padding: 0 0.7em;
  height: 2em;
  line-height: 2em;
  background-color: #9be8a1;
  color: #000000;
  border-radius: 0.2em;
  cursor: default;
}

.summary-duration,
.summary-sum {
  padding: 0 0.2em;
  height: 2em;
  line-height: 2em;
  cursor: default;
}

.third-menu {
  position: absolute;
  top: 3em;
  left: 0;
  right: 0;
  height: 2em;
  line-height: 2em;
  background-color: #f0f0f0;
  color: #000000;
  border-top: 1px solid #b6b6b6;
  border-bottom: 1px solid #b6b6b6;
  text-align: center;
  font-weight: 600;
}
</style>
