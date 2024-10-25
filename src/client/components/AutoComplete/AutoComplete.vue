<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="ac-holder">
    <input
      v-model="searchString"
      :placeholder="hint"
      type="text"
      class="ac-input"
      @input="triggerFast(); triggerSlow();"
      @focus="triggerFast(); triggerSlow();"
      @blur="close()"
    />
    <ul v-if="results.length > 0" class="ac-ul">
      <li v-for="result in results" :key="result._id" class="ac-li" @mousedown="sendResult(result)">
        <span v-for="(partString, index) in result.partStrings" :key="index" :class="{ 'ac-highlight': partString.highlight }">{{ partString.txt }}</span>
      </li>
    </ul>
    <div v-if="loading" class="ac-spinner"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import debounce from 'lodash.debounce';

const notifierStore = useNotifierStore();

const props = defineProps({
  acType: { type: String, required: true },
  hint: { type: String, required: true },
  clearAfter: { type: Boolean, required: false },
});

const emit = defineEmits(['autocomplete-pick']);

const loading = ref(false);
const searchString = ref('');
const resultsRaw = ref([]);

const results = computed(() => {
  const escaped = searchString.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(escaped, 'i');
  return resultsRaw.value.map(result => {
    const target = result.name;
    const index = target.search(pattern);
    const partStrings = [];

    // if no match just pass all target text
    if (index === -1) partStrings.push({ txt: target });

    // text before highlight
    if (index > 0) partStrings.push({ txt: target.substring(0, index) });

    // highlighted part
    if (index !== -1) {
      const txt = target.substring(index, index + searchString.value.length);
      partStrings.push({ txt, highlight: true });
    }

    // text after highlight
    if (index !== -1 && index < target.length) {
      const start = index + searchString.value.length;
      partStrings.push({ txt: target.substring(start, target.length) });
    }

    return { ...result, partStrings };
  });
});

const triggerSlow = debounce(() => {
  triggerSlow1();
}, 250);

function triggerSlow1() {
  if (searchString.value && searchString.value.length >= 2) {
    const methodName = {
      clients: 'autocompleteClients',
      projects: 'autocompleteProjects',
      users: 'autocompleteUsers',
    }[props.acType];
    if (methodName) triggerSlow2(methodName);
  }
}

async function triggerSlow2(methodName) {
  loading.value = true;
  try {
    const res = await Meteor.callAsync(methodName, searchString.value);
    resultsRaw.value = res;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    resultsRaw.value = [];
    loading.value = false;
  }
}

function triggerFast() {
  if (searchString.value && searchString.value.length >= 2) {
    loading.value = true;
  } else {
    resultsRaw.value = [];
    loading.value = false;
  }
}

function close() {
  resultsRaw.value = [];
  loading.value = false;
}

function sendResult(result) {
  emit('autocomplete-pick', result);
  if (props.clearAfter) searchString.value = '';
}
</script>

<style scoped>
.ac-holder {
  position: relative;
}

.ac-input {
  width: 100%;
}

.ac-ul {
  position: absolute;
  z-index: 2;
  list-style-type: none;
  margin: 0.5em 0 0 0;
  padding: 0;
  border: 0.1em solid #2d2d2d;
  border-radius: 0.3em;
  background-color: #ffffff;
  color: #121212;
  box-shadow: 0.3em 0.3em 0em 0em rgba(0, 0, 0, 0.1);
  opacity: 0.95;
  animation-name: ac-results-appear;
  animation-duration: 0.2s;
  animation-iteration-count: 1;
  animation-timing-function: ease;
  transform-origin: 0% 0%;
}

@keyframes ac-results-appear {
  0% {
    transform: scale(0);
  }

  100% {
    transform: scale(1);
  }
}

.ac-ul::before {
  content: '';
  position: absolute;
  top: -0.5em;
  left: 1em;
  width: 0;
  height: 0;
  padding: 0.4em;
  background-color: #ffffff;
  border: inherit;
  border-right: 0;
  border-bottom: 0;
  transform: rotate(45deg);
  z-index: -1;
}

.ac-li {
  margin: 0;
  padding: 0.5em 0.6em;
  border-radius: 0.3em;
  cursor: pointer;
}

.is-mobile .ac-li {
  padding: 0.9em 0.6em;
}

.ac-li:hover {
  background-color: #e8e8e8;
}

.ac-highlight {
  color: red;
}

.ac-spinner {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0.5em;
  margin: auto 0;
  height: 1em;
  width: 1em;
  border: 0.2em dotted limegreen;
  border-radius: 50%;
  animation: spinner 3000ms 0ms infinite forwards linear;
}
</style>
