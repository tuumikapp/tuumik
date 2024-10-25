import { ref } from 'vue';
import { defineStore } from 'pinia';
import { Meteor } from 'meteor/meteor';

export const useGeneralStore = defineStore('general', () => {
  const userId = ref(undefined);
  const user = ref(undefined);
  const tenant = ref(undefined);
  const settings = ref(Meteor.settings.public);
  const isMobile = ref(true);
  const zoomBody = ref(localStorage.zoomBody ? Number.parseInt(localStorage.zoomBody, 10) : 12);
  const pwaBeforeInstall = ref(undefined);

  function zoomBodyInc() {
    if (zoomBody.value < 24) {
      zoomBody.value = zoomBody.value + 1;
      localStorage.zoomBody = zoomBody.value;
    }
  }

  function zoomBodyDec() {
    if (zoomBody.value > 4) {
      zoomBody.value = zoomBody.value - 1;
      localStorage.zoomBody = zoomBody.value;
    }
  }

  return { userId, user, tenant, settings, isMobile, zoomBody, zoomBodyInc, zoomBodyDec, pwaBeforeInstall };
});
