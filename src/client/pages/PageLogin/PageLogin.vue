<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="loginbody">
    <div class="loginbox">
      <div class="logo"></div>
      <div v-if="loggingIn" class="spinner spinner-login"></div>
      <form @submit.prevent="submitForm()">
        <input v-model="email" type="text" placeholder="EMAIL OR USERNAME" class="inp" autofocus />
        <input v-model="password" type="password" placeholder="PASSWORD" class="inp" />
        <input type="submit" value="LOG IN" class="btn-submit" />
      </form>
      <RouterLink v-if="generalStore.settings.demoMode" to="/start-demo" class="demo-link">
        START DEMO
      </RouterLink>
      <RouterLink v-else to="/forgot-password" class="forgot-link">
        FORGOT PASSWORD
      </RouterLink>
      <div v-if="err" class="err">{{ err.reason }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useRouter } from 'vue-router';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

const generalStore = useGeneralStore();
const router = useRouter();
const email = ref('');
const password = ref('');
const err = ref(undefined);
const loggingIn = ref(false);

function submitForm() {
  err.value = undefined;
  Meteor.loginWithPassword(email.value, password.value, err => {
    if (!err) {
      router.push('/');
    } else {
      this.err = err;
    }
  });
}

Tracker.autorun(() => {
  loggingIn.value = Meteor.loggingIn();
});
</script>

<style scoped>
.loginbody {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  font-family: 'Source Sans Pro', Helvetica, Arial, Verdana, sans-serif;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.loginbox {
  position: relative;
  margin: 15vh 0 0 0;
  width: 20em;
  padding: 12em 2em 1em 2em;
  background-color: #ffffff;
  text-align: center;
  border-radius: 0.3em;
  box-shadow: 0.1em 0.1em 0.2em 0.2em rgba(0, 0, 0, 0.1);
}

.is-mobile .loginbox {
  margin: 2em 0 0 0;
}

.inp {
  margin: 0 0 0.9em 0;
  padding: 0.6em;
  width: 100%;
  transition: margin 0ms;
}

.btn-submit {
  margin: 0.1em 0 0.6em 0;
  padding: 0.6em;
  width: 100%;
  transition: margin 0ms;
}

.spinner-login {
  position: absolute;
  top: 1.8em;
  left: 0;
  right: 0;
  margin: 0 auto;
  height: 8em;
  width: 8em;
}

.logo {
  position: absolute;
  top: 3.6em;
  left: 0;
  right: 0;
  width: 5em;
  height: 5em;
  margin: 0 auto;
  background-image: url('/icons/logo.svg');
  background-repeat: no-repeat;
  background-size: auto 80%;
  background-position: center;
  animation: logoappear 700ms 0ms ease-in;
}

@keyframes logoappear {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }

  50% {
    transform: scale(1);
  }

  100% {
    opacity: 1;
  }
}

.demo-link {
  margin: 2em 0 0 0;
  display: inline-block;
  color: #1f1f1f;
}

.forgot-link {
  margin: 2em 0 0 0;
  display: inline-block;
  color: #7f7f7f;
}

.err {
  position: absolute;
  top: 27em;
  left: 0;
  right: 0;
  margin: 0 auto;
  padding: 1em;
  background-color: #44404d;
  color: #ffffff;
  font-weight: 600;
  border-radius: 0.3em;
  box-shadow: 0.1em 0.1em 0.3em rgba(0, 0, 0, 0.1);
}
</style>
