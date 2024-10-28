<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <h1>Timesheet Explorer</h1>
    <div class="search-terms-holder">
      <div class="search-terms-projects">
        <div class="search-terms-title">CLIENTS AND PROJECTS</div>
        <div v-for="picker in projectPickers" :key="picker.id" class="p-picker">
          <ProjectPicker
            :client-id="picker.clientId"
            :client="picker.client"
            :project-id="picker.projectId"
            :project="picker.project"
            :sel-projects="picker.selProjects"
            class="project-picker"
            @set-client-id="picker.clientId = $event"
            @set-client="picker.client = $event"
            @set-project-id="picker.projectId = $event"
            @set-project="picker.project = $event"
            @set-sel-projects="picker.selProjects = $event"
          />
          <div class="picker-del" @click="delProjectPicker(picker)"></div>
        </div>
        <div class="btn" @click="addProjectPicker()">ADD CLIENT/PROJECT</div>
      </div>
      <div class="search-terms-users">
        <div class="search-terms-title">USERS</div>
        <div>
          <AutoComplete ac-type="users" hint="USERS" class="set-user-inp" @autocomplete-pick="addSearchUser($event)" />
        </div>
        <div v-for="searchUser in searchUsers" :key="searchUser._id" class="terms-user">
          {{ searchUser.name }}
          <div class="terms-user-del" @click="delSearchUser(searchUser)"></div>
        </div>
      </div>
      <div class="search-terms-period">
        <div class="search-terms-title">PERIOD</div>
        <span class="period-box">
          {{ displayDate(period.start) }}
          <DatePicker :source-date="period.start.valueOf()" :selected-date="period.start.valueOf()" class="period-picker" @datepicker-pick="selectPeriodStart($event)" />
        </span>
        <span class="period-box">
          {{ displayDate(period.end) }}
          <DatePicker :source-date="period.end.valueOf()" :selected-date="period.end.valueOf()" class="period-picker" @datepicker-pick="selectPeriodEnd($event)" />
        </span>
      </div>
      <div class="search-terms-task">
        <div class="search-terms-title">TASK</div>
        <input v-model="taskDesc" type="text" maxlength="100" placeholder="TASK" class="task-inp" />
      </div>
      <div class="search-terms-tag">
        <div class="search-terms-title">TAG</div>
        <div :class="{ 'tag-box-on': tagColor.green }" class="tag-box tag-green" @click="tagColor.green = !tagColor.green"></div>
        <div :class="{ 'tag-box-on': tagColor.yellow }" class="tag-box tag-yellow" @click="tagColor.yellow = !tagColor.yellow"></div>
        <div :class="{ 'tag-box-on': tagColor.red }" class="tag-box tag-red" @click="tagColor.red = !tagColor.red"></div>
        <div :class="{ 'tag-box-on': tagColor.grey }" class="tag-box tag-grey" @click="tagColor.grey = !tagColor.grey"></div>
        <div :class="{ 'tag-box-on': tagColor.clear }" class="tag-box tag-clear" @click="tagColor.clear = !tagColor.clear"></div>
        <input v-model="tagText" type="text" maxlength="100" placeholder="TAG TEXT" class="tag-text-inp" />
      </div>
      <div class="search-terms-sort">
        <div class="search-terms-title">SORT RESULTS</div>
        <select v-model="sort.first" class="sort-sel">
          <option value="none">-</option>
          <option value="date">DATE</option>
          <option value="project">PROJECT</option>
          <option value="user">USER</option>
          <option value="task">TASK</option>
          <option value="tag-color">TAG-COLOR</option>
          <option value="tag-text">TAG-TEXT</option>
        </select>
        <select v-model="sort.second" class="sort-sel">
          <option value="none">-</option>
          <option value="date">DATE</option>
          <option value="project">PROJECT</option>
          <option value="user">USER</option>
          <option value="task">TASK</option>
          <option value="tag-color">TAG-COLOR</option>
          <option value="tag-text">TAG-TEXT</option>
        </select>
        <select v-model="sort.third" class="sort-sel">
          <option value="none">-</option>
          <option value="date">DATE</option>
          <option value="project">PROJECT</option>
          <option value="user">USER</option>
          <option value="task">TASK</option>
          <option value="tag-color">TAG-COLOR</option>
          <option value="tag-text">TAG-TEXT</option>
        </select>
      </div>
      <div class="terms-submit btn-submit" @click="loadData()">SEARCH</div>
    </div>

    <div v-if="meta" class="search-meta-holder">
      <div v-if="times.length === generalStore.settings.composerLimit" class="max-results">
        Displaying a maximum of {{ generalStore.settings.composerLimit }} results. Please use narrower search criteria.
      </div>
      <div>Results: {{ times.length }}</div>
      <div>Selected: {{ selectedTimes.length }}</div>
      <div class="meta-clients">
        <div v-for="metaClient in meta.clients" :key="metaClient._id" class="meta-client">
          {{ metaClient.name }}
          <div v-for="metaProject in metaClient.projects" :key="metaProject.name" class="meta-project">
            {{ metaProject.name }}
          </div>
        </div>
      </div>
      <div class="meta-users">
        <div v-for="metaUser in meta.users" :key="metaUser._id" class="meta-user">
          {{ metaUser.name }}
        </div>
      </div>
      <div>Period start: {{ displayDate(meta.period.start) }}</div>
      <div>Period end: {{ displayDate(meta.period.end) }}</div>
      <div>Task: {{ meta.taskDesc }}</div>
      <div v-if="meta.tagColor" class="mtag-holder">
        Tag color:
        <div v-if="meta.tagColor.green" class="mtag-box tag-green"></div>
        <div v-if="meta.tagColor.yellow" class="mtag-box tag-yellow"></div>
        <div v-if="meta.tagColor.red" class="mtag-box tag-red"></div>
        <div v-if="meta.tagColor.grey" class="mtag-box tag-grey"></div>
        <div v-if="meta.tagColor.clear" class="mtag-box tag-clear"></div>
      </div>
      <div>Tag text: {{ meta.tagText }}</div>
      <div>
        Sort:
        <div v-if="meta.sort.first !== 'none'" class="sort-box">
          {{ meta.sort.first }}
        </div>
        <div v-if="meta.sort.second !== 'none'" class="sort-box">
          {{ meta.sort.second }}
        </div>
        <div v-if="meta.sort.third !== 'none'" class="sort-box">
          {{ meta.sort.third }}
        </div>
      </div>
    </div>
    <div v-if="times.length" class="selnotice-holder">
      <div class="selnotice">CLICK ROW TO SELECT</div>
      <div class="selnotice">CTRL + CLICK TO SELECT MULTIPLE</div>
      <div class="selnotice">SHIFT + CLICK TO SELECT RANGE</div>
    </div>

    <table v-if="times.length" class="timetable">
      <tr>
        <th class="tth">Tag</th>
        <th class="tth">Client</th>
        <th class="tth">Project</th>
        <th class="tth">Date</th>
        <th class="tth">Duration</th>
        <th class="tth">User</th>
        <th class="tth">Task</th>
      </tr>
      <tr v-for="time in times" :key="time._id" :class="{ 'ttr-selected': timeIsSelected(time) }" class="ttr" @click.prevent="selectTime($event, time)">
        <td
          :class="{
            'tag-green': time.tagColor === 'green',
            'tag-yellow': time.tagColor === 'yellow',
            'tag-red': time.tagColor === 'red',
            'tag-grey': time.tagColor === 'grey',
          }"
          class="ttd ttag"
        >
          {{ time.tagText }}
        </td>
        <td class="ttd tclient">{{ time.clientName }}</td>
        <td class="ttd tproject">{{ time.projectName }}</td>
        <td class="ttd tdate">{{ displayDate(time.date) }}</td>
        <td class="ttd tduration">{{ displayDuration(time) }}</td>
        <td class="ttd towner">{{ time.ownerName }}</td>
        <td class="ttd ttask">
          <span v-if="time.useTaskType">{{ time.taskType }} </span>{{ time.taskDesc }}
          <div v-if="time.intCom" class="intcom">{{ time.intCom }}</div>
        </td>
      </tr>
    </table>

    <div v-if="times.length" class="circle-btn circle-btn-tags" @click="showTagPopup = !showTagPopup">
      <span class="c-tip c-tip-rev">TAGS</span>
    </div>
    <div v-else class="circle-btn circle-btn-tags circle-btn-off"></div>
    <div v-if="times.length" class="circle-btn circle-btn-xlsx" @click="toggleExportPopup()">
      <span class="c-tip c-tip-rev">EXPORT</span>
    </div>
    <div v-else class="circle-btn circle-btn-xlsx circle-btn-off"></div>

    <div v-if="showExportPopup" class="export-popup">
      <div class="export-popup-close" @click="toggleExportPopup()"></div>
      <div class="export-fields-holder">
        <label class="single-checkbox-label">
          <input v-model="exportOptions.showFields.rowRef" type="checkbox" />
          <span>ROW</span>
        </label>
        <label class="single-checkbox-label">
          <input v-model="exportOptions.showFields.date" type="checkbox" />
          <span>DATE</span>
        </label>
        <label class="single-checkbox-label">
          <input v-model="exportOptions.showFields.client" type="checkbox" />
          <span>CLIENT</span>
        </label>
        <label class="single-checkbox-label">
          <input v-model="exportOptions.showFields.project" type="checkbox" />
          <span>PROJECT</span>
        </label>
        <label class="single-checkbox-label">
          <input v-model="exportOptions.showFields.user" type="checkbox" />
          <span>USER</span>
        </label>
        <label class="single-checkbox-label">
          <input v-model="exportOptions.showFields.task" type="checkbox" />
          <span>TASK</span>
        </label>
        <label class="single-checkbox-label">
          <input v-model="exportOptions.showFields.duration" type="checkbox" />
          <span>DURATION</span>
        </label>
        <label class="single-checkbox-label">
          <input v-model="exportOptions.showFields.rate" type="checkbox" />
          <span>RATE</span>
        </label>
        <label class="single-checkbox-label">
          <input v-model="exportOptions.showFields.sum" type="checkbox" />
          <span>SUM</span>
        </label>
      </div>
      <span v-for="compExp in composerExportersFront" :key="compExp.id" class="exp-btn-holder">
        <div v-if="loadingExport" class="btn-submit exp-btn-off">
          {{ compExp.name }}
        </div>
        <div v-else class="btn-submit" @click="sendToExporter(compExp)">
          {{ compExp.name }}
        </div>
      </span>
      <div v-if="loadingExport" class="export-loading">
        <div class="spinner spinner-export"></div>
      </div>
      <div v-else-if="exportFiles.length">
        <div v-for="exportFile in exportFiles" :key="exportFile.fileName">
          <a :href="exportFile.fileData" :download="exportFile.fileName" class="btn-submit export-save">
            DOWNLOAD
            <div class="export-save-name">{{ exportFile.fileName }}</div>
          </a>
        </div>
      </div>
    </div>

    <div v-if="showTagPopup" class="tag-popup">
      <div class="tag-popup-close" @click="showTagPopup = false"></div>
      <span class="color-box tag-green" @click="setTagColor('green')"></span>
      <span class="color-box tag-yellow" @click="setTagColor('yellow')"></span>
      <span class="color-box tag-red" @click="setTagColor('red')"></span>
      <span class="color-box tag-grey" @click="setTagColor('grey')"></span>
      <span class="color-box tag-clear" @click="setTagColor('')"></span>
      <form @submit.prevent="setTagText($event.target.tagtext.value)">
        <input name="tagtext" type="text" class="tag-inp" maxlength="20" placeholder="TAG TEXT" />
        <input type="submit" value="SAVE TEXT" class="btn-submit tag-btn" />
      </form>
    </div>

    <div v-if="loading" class="spinner spinner-global"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Meteor } from 'meteor/meteor';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { minutesToDuration } from '/src/shared/utils/time.js';
import formatSum from '/src/client/utils/sums.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import ProjectPicker from '/src/client/components/ProjectPicker/ProjectPicker.vue';
import DatePicker from '/src/client/components/DatePicker/DatePicker.vue';
import AutoComplete from '/src/client/components/AutoComplete/AutoComplete.vue';

dayjs.extend(utc);

const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();

const times = ref([]);
const meta = ref('');
const currency = ref({});
const composerExportersFront = ref([]);
const loading = ref(false);
const loadingExport = ref(false);
const selectedTimes = ref([]);
const showTagPopup = ref(false);
const showExportPopup = ref(false);
const projectPickers = ref([{ id: 1, clientId: '', client: null, projectId: '', project: null, selProjects: [] }]);
const period = ref({ start: dayjs.utc().subtract(2, 'months').startOf('month').toDate(), end: dayjs.utc().endOf('month').toDate() });
const searchUsers = ref([]);
const taskDesc = ref('');
const tagColor = ref({ green: false, yellow: false, red: false, grey: false, clear: false, });
const tagText = ref('');
const sort = ref({ first: 'date', second: 'none', third: 'none' });
const exportOptions = ref({ showFields: { rowRef: true, date: true, client: false, project: false, user: true, task: true, duration: true, rate: true, sum: true } });
const exportFiles = ref([]);

async function loadData() {
  loading.value = true;
  const projectPickersProcessed = [];
  for (const x of projectPickers.value) {
    if (x.clientId || x.projectId) projectPickersProcessed.push(x);
  }
  const searchUsersOut = searchUsers.value.map(x => x._id);
  const searchTerms = {
    projectPickers: projectPickersProcessed,
    searchUsers: searchUsersOut,
    period: period.value,
    taskDesc: taskDesc.value,
    tagColor: tagColor.value,
    tagText: tagText.value,
    sort: sort.value
  };
  try {
    const res = await Meteor.callAsync('composerAll', searchTerms);
    times.value = res.times;
    meta.value = res.meta;
    currency.value = res.currency;
    composerExportersFront.value = res.composerExportersFront;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function setTagColor(color) {
  loading.value = true;
  const selTimes = selectedTimes.value;
  try {
    await Meteor.callAsync('composerTagColor', selTimes, color);
    times.value = times.value.map(time => {
      const timeNew = { ...time };
      if (selTimes.includes(time._id)) timeNew.tagColor = color;
      return timeNew;
    });
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function setTagText(text) {
  loading.value = true;
  const selTimes = selectedTimes.value;
  try {
    await Meteor.callAsync('composerTagText', selTimes, text);
    times.value = times.value.map(time => {
      const timeNew = { ...time };
      if (selTimes.includes(time._id)) timeNew.tagText = text;
      return timeNew;
    });
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function toggleExportPopup() {
  if (showExportPopup.value) {
    showExportPopup.value = false;
    exportFiles.value = [];
  } else {
    showExportPopup.value = true;
  }
}

function displayDuration(time) {
  const x = time.endMinute - time.startMinute;
  return minutesToDuration(x);
}

function displayDurationReport(dur) {
  return minutesToDuration(dur);
}

function displayDate(date, notUtc, customFormat) {
  const format = customFormat || generalStore.tenant.dateFormat;
  return !notUtc ? dayjs.utc(date).format(format) : dayjs(date).format(format);
}

function formatSumOut(sum) {
  const { thouMark } = generalStore.tenant;
  const { decimalMark } = generalStore.tenant;
  return formatSum(sum, thouMark, decimalMark);
}

// search terms
function addProjectPicker() {
  const pickerObj = {
    id: 1,
    clientId: '',
    client: null,
    projectId: '',
    project: null,
    selProjects: [],
  };
  pickerObj.id = projectPickerGenerateUniqueId();
  projectPickers.value.push(pickerObj);
}

function projectPickerGenerateUniqueId() {
  let maxId = 1000;
  for (const projectPicker of projectPickers.value) {
    if (maxId < projectPicker.id) maxId = projectPicker.id;
  }
  return maxId + 1;
}

function delProjectPicker(picker) {
  const index = projectPickers.value.findIndex(x => x.id === picker.id);
  if (index > -1) projectPickers.value.splice(index, 1);
}

function addSearchUser(result) {
  const existingUser = searchUsers.value.find(x => x._id === result._id);
  if (!existingUser) {
    const user = { _id: result._id, name: result.name };
    searchUsers.value.push(user);
  }
}

function delSearchUser(searchUser) {
  const index = searchUsers.value.findIndex(x => x._id === searchUser._id);
  if (index > -1) searchUsers.value.splice(index, 1);
}

function selectPeriodStart(pickerDate) {
  if (pickerDate <= period.value.end) {
    period.value.start = pickerDate;
  }
}

function selectPeriodEnd(pickerDate) {
  if (pickerDate >= period.value.start) {
    period.value.end = pickerDate;
  }
}
// /search terms

// time selection
function selectTime(event, time) {
  const index = selectedTimes.value.indexOf(time._id);
  if (!event.ctrlKey && !event.shiftKey) {
    // single select
    if (index > -1) {
      selectedTimes.value = [];
    } else {
      selectedTimes.value = [time._id];
    }
  } else if (event.ctrlKey) {
    // one-by-one select with ctrl key
    if (index > -1) {
      selectedTimes.value.splice(index, 1);
    } else {
      selectedTimes.value.push(time._id);
    }
  } else if (event.shiftKey) {
    // group select with shift key
    let firstTimeIndex;
    let lastTimeIndex = false;
    let clickedTimeIndex = false;
    for (let i = 0; i < times.value.length; i += 1) {
      if (selectedTimes.value.includes(times.value[i]._id)) {
        if (firstTimeIndex === undefined) firstTimeIndex = i;
        lastTimeIndex = i;
      }
      if (times.value[i]._id === time._id) clickedTimeIndex = i;
    }
    if (firstTimeIndex < clickedTimeIndex) {
      // group select upward
      const selTimes = [];
      for (let i = firstTimeIndex; i < clickedTimeIndex + 1; i += 1) {
        selTimes.push(times.value[i]._id);
      }
      selectedTimes.value = selTimes;
    } else if (lastTimeIndex > clickedTimeIndex) {
      // group select downward
      const selTimes = [];
      for (let i = clickedTimeIndex; i < lastTimeIndex + 1; i += 1) {
        selTimes.push(times.value[i]._id);
      }
      selectedTimes.value = selTimes;
    }
  }
}

function timeIsSelected(time) {
  return !!selectedTimes.value.includes(time._id);
}
// /time selection

// export to exporter
async function sendToExporter(compExp) {
  loadingExport.value = true;
  const times2 = times.value.filter(time => selectedTimes.value.includes(time._id));
  const args = { exporterId: compExp.id, exportOptions: exportOptions.value, times: times2, meta: meta.value };
  try {
    const res = await Meteor.callAsync('composerExporter', args);
    exportFiles.value = res.exportFiles || [];
    if (!res.exportFiles && res.exportSuccess) notifierStore.addTemp({ type: 'success', txt: 'EXPORTED' }); // show feedback to use if exporter is not meant to return exportFiles array
    loadingExport.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loadingExport.value = false;
  }
}
// /export to exporter
</script>

<style scoped>
/* SEARCH TERMS: GENERAL */
.search-terms-holder {
  padding: 1em;
  margin: 0 0 2em 0;
  border: 1px solid #e9e9e9;
  border-radius: 0.4em;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.search-terms-projects {
  padding: 3em 1em 1em 1em;
  margin: 1em;
  background-color: #cccccc;
  border-radius: 0.4em;
  min-width: 40em;
  flex-grow: 3;
  position: relative;
}

.search-terms-users {
  padding: 3em 1em 1em 1em;
  margin: 1em;
  background-color: #cccccc;
  border-radius: 0.4em;
  min-width: 20em;
  flex-grow: 1;
  position: relative;
}

.search-terms-period {
  padding: 3em 1em 1em 1em;
  margin: 1em;
  background-color: #cccccc;
  border-radius: 0.4em;
  width: 14em;
  flex-grow: 1;
  position: relative;
}

.search-terms-task {
  padding: 3em 1em 1em 1em;
  margin: 1em;
  background-color: #cccccc;
  border-radius: 0.4em;
  min-width: 20em;
  flex-grow: 1;
  position: relative;
}

.search-terms-tag {
  padding: 3em 1em 1em 1em;
  margin: 1em;
  background-color: #cccccc;
  border-radius: 0.4em;
  min-width: 20em;
  flex-grow: 1;
  position: relative;
  display: flex;
  align-items: flex-start;
}

.search-terms-sort {
  padding: 3em 1em 1em 1em;
  margin: 1em;
  background-color: #cccccc;
  border-radius: 0.4em;
  min-width: 20em;
  flex-grow: 1;
  position: relative;
}

.search-terms-title {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  line-height: 2em;
  text-align: center;
  background-color: #7a7a7a;
  color: #ffffff;
}

.terms-submit {
  width: 100%;
  height: 4em;
  margin: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* /SEARCH TERMS: GENERAL */

/* SEARCH TERMS: PROJECT PICKERS */
.p-picker {
  padding: 0 5em 0 0;
  margin: 0 0 12px 0;
  position: relative;
}

.picker-del {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 4em;
  background-color: #7f7f7f;
  background-image: url('/icons/close-light.svg');
  background-repeat: no-repeat;
  background-size: 40% auto;
  background-position: center center;
}
/* /SEARCH TERMS: PROJECT PICKERS */

/* SEARCH TERMS: USERS */
.terms-user {
  padding: 1em 5em 1em 1em;
  margin: 12px 0 0 0;
  background-color: #9f9f9f;
  position: relative;
}

.terms-user-del {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 4em;
  background-color: #7f7f7f;
  background-image: url('/icons/close-light.svg');
  background-repeat: no-repeat;
  background-size: 40% auto;
  background-position: center center;
}
/* /SEARCH TERMS: USERS */

/* SEARCH TERMS: PERIOD */
.period-box {
  padding: 0.5em 1em;
  background-color: #c9c9c9;
  display: inline-block;
  position: relative;
  user-select: none;
}

.period-picker {
  display: none;
}

.period-box:hover .period-picker {
  position: absolute;
  top: 2em;
  left: 0;
  display: block;
}

.period-box:hover {
  background-color: #e0e0e0;
  z-index: 1;
}
/* /SEARCH TERMS: PERIOD */

/* SEARCH TERMS: TASK */
.task-inp {
  width: 100%;
}
/* /SEARCH TERMS: TASK */

/* SEARCH TERMS: TAG */
.tag-box {
  margin: 0 0.6em 0 0;
  width: 2.4em;
  height: 2.4em;
  border: 1px solid #979797;
  border-radius: 0.2em;
  box-sizing: border-box;
  opacity: 0.4;
}

.tag-box:hover {
  opacity: 0.6;
}

div .tag-box-on,
div .tag-box-on:hover {
  border: 3px solid #111111;
  opacity: 1;
}

.tag-text-inp {
  flex-grow: 1;
}
/* /SEARCH TERMS: TAG */

/* SEARCH TERMS: SORT */
.sort-sel {
  width: 9em;
}
/* /SEARCH TERMS: SORT */

/* SEARCH META */
.search-meta-holder {
  padding: 1.4em 2em;
  margin: 0 0 2em 0;
  border: 1px solid #e9e9e9;
  border-radius: 0.4em;
}

.max-results {
  color: red;
}

.meta-clients {
  margin: 0;
}

.meta-client {
  margin: 0;
}

.meta-project {
  padding: 0 0 0 2em;
}

.mtag-holder {
  display: flex;
}

.mtag-box {
  margin: 0 4px 0 0;
  width: 1.4em;
  height: 1.4em;
  border: 1px solid #979797;
  border-radius: 0.2em;
}

.sort-box {
  display: inline;
  text-transform: uppercase;
}
/* /SEARCH META */

/* SELECTION INSTRUCTIONS */
.selnotice-holder {
  display: flex;
  justify-content: flex-start;
}

.selnotice {
  margin: 0 2em 0 0;
  font-size: 0.9em;
  color: grey;
}
/* /SELECTION INSTRUCTIONS */

/* TIME TABLE */
.timetable {
  width: 100%;
  border-collapse: collapse;
  color: #1f1f1f;
  margin: 0 0 9em 0;
  user-select: none;
}

.tth {
  border: 1px solid #cecece;
  padding: 1.4em 0.4em;
  text-align: left;
  font-weight: 600;
}

.ttr-selected {
  background-color: #02c97c;
}

.ttd {
  border: 1px solid #d6d6d6;
  padding: 0.2em 0.4em;
  vertical-align: top;
}

.ttag {
  width: 3em;
  background-color: #ffffff;
  white-space: nowrap;
}

.tdate {
  width: 6em;
}

.tduration {
  width: 4.2em;
}

.tsum {
  width: 12em;
}

.towner {
  width: 14em;
}

.intcom {
  color: #0060ff;
}
/* /TIME TABLE */

/* CIRCLE BUTTONS */
.circle-btn {
  position: fixed;
  bottom: 1em;
  right: 1em;
  width: 5em;
  height: 5em;
  background-color: #ffffff;
  border: 1px solid #cecece;
  border-radius: 50%;
  z-index: 2000;
  box-shadow: 0.1em 0.1em 0.2em 0.2em rgba(0, 0, 0, 0.03);
  background-image: url('/icons/plus-green.svg');
  background-repeat: no-repeat;
  background-size: 70% auto;
  background-position: center center;
  transition: transform 100ms ease-out;
  user-select: none;
}

.circle-btn:hover {
  transform: scale(1.15);
}

.is-mobile .circle-btn:hover {
  transform: none;
}

.circle-btn-off {
  opacity: 0.3;
}

.circle-btn-tags {
  background-image: url('/icons/tags.svg');
}

.circle-btn-xlsx {
  right: 9em;
  background-image: url('/icons/xlsx.svg');
}

.circle-btn-tags .c-tip {
  transform: translateX(-1.3em);
}

.circle-btn-xlsx .c-tip {
  transform: translateX(-0.7em);
}
/* /CIRCLE BUTTONS */

/* EXPORT POPUP */
.export-popup {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 22em;
  height: 25em;
  margin: auto;
  background-color: #f9f9f9;
  border: 1px solid #cecece;
  border-radius: 0.3em;
  padding: 4em 2em 2em 2em;
  overflow-y: auto;
  box-shadow: 0.3em 0.3em 0em 0em rgba(0, 0, 0, 0.1);
  z-index: 1001;
}

.export-popup-close {
  position: absolute;
  top: 0;
  right: 0;
  height: 2em;
  width: 2em;
  background-color: #dbdbdb;
  background-image: url('/icons/close-dark.svg');
  background-repeat: no-repeat;
  background-size: 70% auto;
  background-position: center center;
}

.export-popup-close:hover {
  background-color: #e4e4e4;
}

.exp-btn-holder {
  margin: 0 1em 0 0;
}

.exp-btn-off {
  opacity: 0.3;
}

.export-loading {
  height: 4em;
  padding: 0.5em 0.6em;
  margin: 1em 0 0 0;
  border: 1px dashed #e5e5e5;
  border-radius: 0.3em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-export {
  width: 2em;
  height: 2em;
}

.export-save {
  display: block;
  height: 4em;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.export-save-name {
  color: #1f1f1f;
  width: 100%;
  text-align: center;
}

.export-fields-holder {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  margin: 0 0 1em 0;
}

.single-checkbox-label {
  width: 43%;
}
/* /EXPORT POPUP */

/* TIME TAGS */
.tag-popup {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 16em;
  height: 9em;
  margin: auto;
  background-color: #f9f9f9;
  border: 1px solid #cecece;
  border-radius: 0.3em;
  padding: 4em 2em 2em 2em;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  box-shadow: 0.3em 0.3em 0em 0em rgba(0, 0, 0, 0.1);
  z-index: 1001;
}

.tag-popup-close {
  position: absolute;
  top: 0;
  right: 0;
  height: 2em;
  width: 2em;
  background-color: #dbdbdb;
  background-image: url('/icons/close-dark.svg');
  background-repeat: no-repeat;
  background-size: 70% auto;
  background-position: center center;
}

.tag-popup-close:hover {
  background-color: #e4e4e4;
}

.color-box {
  width: 2em;
  height: 2em;
  border: 1px solid #979797;
  border-radius: 0.2em;
}

.tag-green {
  background-color: limegreen;
  color: #1f1f1f;
}

.tag-yellow {
  background-color: yellow;
  color: #1f1f1f;
}

.tag-red {
  background-color: #ff5f5f;
  color: #ffffff;
}

.tag-grey {
  background-color: #696969;
  color: #ffffff;
}

.tag-clear {
  background-color: transparent;
  border: 1px solid #5f5f5f;
  box-sizing: border-box;
}

.tag-inp {
  width: 100%;
  margin: 2em 0 0 0;
}

.tag-btn {
  width: 100%;
  margin: 0.4em 0 0 0;
}
/* /TIME TAGS */
</style>
