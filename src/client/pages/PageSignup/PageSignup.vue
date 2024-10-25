<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <form class="main-pane" @submit.prevent="signup1()">
      <h2 class="top-h2">SIGN UP</h2>
      <div v-if="!allowSignup" class="disabled-notice">
        Signup is disabled on this server. Please contact an administrator if you wish to sign up.
      </div>
      <div v-else-if="showCodeSection">
        <div class="code-notice">
          Signing up requires a code. Please contact an administrator if you wish to sign up.
        </div>
        <label for="code" class="field-label">SIGNUP CODE:</label>
        <input id="code" v-model="signupCode" type="text" maxlength="50" />
      </div>
      <div class="section-title">ORGANIZATION SIGNING UP FOR TUUMIK</div>
      <label for="tenant-name" class="field-label">ORGANIZATION NAME:</label>
      <input id="tenant-name" v-model="tenant.name" type="text" maxlength="500" autofocus />
      <label for="tenant-email" class="field-label">ORGANIZATION EMAIL:</label>
      <input id="tenant-email" v-model="tenant.email" type="text" maxlength="100" />
      <label for="tenant-phone" class="field-label">ORGANIZATION TELEPHONE:</label>
      <input id="tenant-phone" v-model="tenant.phone" type="text" maxlength="50" placeholder="+123456789" />
      <div class="field-tip">
        Must include country code.
      </div>
      <div class="section-title">
        YOUR PERSONAL USER ACCOUNT IN THE ORGANIZATION
      </div>
      <label for="user-name" class="field-label">YOUR NAME:</label>
      <input id="user-name" v-model="user.name" type="text" maxlength="50" />
      <label for="user-email" class="field-label">YOUR EMAIL:</label>
      <input id="user-email" v-model="user.email" type="text" maxlength="70" />
      <label for="psw-first" class="field-label">PASSWORD:</label>
      <input id="psw-first" v-model="password1" type="password" maxlength="100" />
      <div class="field-tip">
        At least 1 upper case, 1 lower case, 1 number. At least 8 characters.
      </div>
      <label for="psw-second" class="field-label">PASSWORD AGAIN:</label>
      <input id="psw-second" v-model="password2" type="password" maxlength="100" />
      <div class="legal-notice">
        This software application (hereinafter "Tuumik") is developed by Tuumik Systems OÜ, a company registered in Estonia. Tuumik is protected by copyright.
        Tuumik is free to use for small teams. Please see licensing terms inside the app on "Subscriptions & Billing" page for more details.
      </div>
      <input type="submit" value="CREATE ORGANIZATION AND USER ACCOUNT" class="btn-submit" />
      <div v-if="loading" class="spinner spinner-global"></div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import { hashPassword } from '/src/client/utils/accounts';
import { isValidEmailAddress, isValidPasswordStrength } from '/src/client/utils/validation';

const router = useRouter();
const route = useRoute();
const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();

const tenantInit = { name: '', email: '', phone: '' };
const userInit = { name: '', email: '' };

const loading = ref(false);
const tenant = ref(tenantInit);
const user = ref(userInit);
const password1 = ref('');
const password2 = ref('');
const signupCode = ref('');
const showCodeSection = ref(false);
const allowSignup = ref(true);

onMounted(() => {
  if (generalStore.settings.demoMode) router.push('/');
  loadSignupSettings();
  if (route.query.code) signupCode.value = route.query.code;
});

async function loadSignupSettings() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('loadSignupSettings');
    showCodeSection.value = res.requireSignupCode;
    allowSignup.value = res.allowSignup;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function signup1() {
  if (!tenant.value.name || !tenant.value.email || !tenant.value.phone || !user.value.name || !user.value.email || !password1.value) {
    notifierStore.addTemp({ type: 'error', txt: 'PLEASE FILL ALL FIELDS' });
  } else {
    signup2();
  }
}

function signup2() {
  if (password1.value !== password2.value) {
    notifierStore.addTemp({ type: 'error', txt: 'PASSWORDS DO NOT MATCH' });
  } else {
    signup3();
  }
}

function signup3() {
  if (!isValidEmailAddress(tenant.value.email)) {
    notifierStore.addTemp({ type: 'error', txt: 'INVALID EMAIL ADDRESS (ORGANIZATION)' });
  } else {
    signup4();
  }
}

function signup4() {
  if (!isValidEmailAddress(tenant.value.email)) {
    notifierStore.addTemp({ type: 'error', txt: 'INVALID EMAIL ADDRESS (USER)' });
  } else {
    signup5();
  }
}

function signup5() {
  if (!isValidPasswordStrength(password1.value)) {
    notifierStore.addTemp({ type: 'error', txt: 'INSUFFICIENT PASSWORD STRENGTH' });
  } else {
    signup6();
  }
}

async function signup6() {
  loading.value = true;
  const args = {
    tenant: tenant.value,
    user: user.value,
    password: hashPassword(password1.value),
    signupCode: signupCode.value,
  };
  try {
    await Meteor.callAsync('insertTenantAndUser', args);
    notifierStore.addTemp({ type: 'success', txt: 'ORGANIZATION AND USER ACCOUNT CREATED' });
    router.push('/login');
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}
</script>

<style scoped>
.disabled-notice {
  padding: 2em;
  background-color: #ececec;
  border-radius: 0.3em;
  font-weight: 600;
  margin: 2em 0 1em 0;
}

.code-notice {
  padding: 2em;
  background-color: #ececec;
  border-radius: 0.3em;
  font-weight: 600;
  margin: 2em 0 1em 0;
}

.legal-notice {
  font-weight: 600;
  padding: 2em 0 1em 0;
  text-align: justify;
}

.legal-link {
  color: #007e4e;
}

.legal-link:hover {
  color: #00995e;
}

.btn-submit {
  padding: 1em 2em;
}

.spinner {
  border: 3px dashed #292929;
}
</style>
