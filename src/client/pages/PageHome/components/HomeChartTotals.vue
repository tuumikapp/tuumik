<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="chart-holder">
    <canvas id="chart-totals" width="400" :height="generalStore.isMobile ? 400 : 150"></canvas>
    <div v-if="loading" class="spinner spinner-local"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import { Chart, LineController, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import dayjs from 'dayjs';

Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement);

const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();
const loading = ref(false);
let chart1 = undefined; // chartjs objects need to be in a plain js variable instead of Vue reactive source (like ref), otherwise chartjs will malfunction

onMounted(() => {
  createChart();
  loadChart();
});

async function loadChart() {
  loading.value = true;
  const targetDate = new Date().toISOString();
  try {
    const res = await Meteor.callAsync('loadHomeChartTotals', targetDate);
    updateChart(res);
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function createChart() {
  const labels = [];
  const daysInMonth = dayjs().endOf('month').date();
  for (let i = 1; i <= daysInMonth; i += 1) {
    labels.push(String(i));
  }
  const datasets = [];
  const data = { labels, datasets };
  const ctx = document.getElementById('chart-totals');
  chart1 = new Chart(ctx, {
    type: 'line',
    data,
    options: {
      title: {
        display: true,
        text: dayjs().format('MMMM YYYY'),
      },
    },
  });
}

function updateChart(res) {
  const data1 = res.points.map((elem, index) => {
    const value = res.points.slice(0, index + 1).reduce((a, b) => a + b);
    const valueHours = value / 60;
    return Math.round(valueHours * 100) / 100;
  });
  const dataset1 = {
    label: 'Tracked Hours',
    backgroundColor: 'rgba(0, 171, 106, 0.06)',
    borderColor: 'rgba(0, 145, 90, 0.9)',
    pointBackgroundColor: 'rgba(0, 171, 106, 1)',
    pointBorderColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 2,
    lineTension: 0,
    order: 1,
    data: data1,
  };
  const datasets = [dataset1];
  chart1.data.datasets = datasets;
  chart1.update();
}
</script>

<style scoped>
.chart-holder {
  background-color: #ffffff;
  color: #1f1f1f;
  padding: 1em;
  margin: 0 0 2em 0;
  position: relative;
  box-shadow: 0.1em 0.1em 0.2em 0.2em rgba(0, 0, 0, 0.1);
  border-radius: 0.2em;
}

#chart-totals {
  width: 100%;
}

.spinner-local {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: 2em;
  height: 2em;
}
</style>
