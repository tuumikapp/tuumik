<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div>
    <h1>Subscriptions & Billing</h1>
    <div v-if="generalStore.settings.demoMode" class="main-pane">
      This page not available in demo environment.
    </div>
    <div v-else-if="loading" class="main-pane">
      <div class="spinner spinner-local"></div>
    </div>
    <div v-else-if="!subData.billingEnabled" class="main-pane">
      <div v-if="subData.textBillingDisabled">{{ subData.textBillingDisabled }}</div>
      <div v-else>Billing disabled. Contact support@tuumik.com if you need assistance.</div>
    </div>
    <div v-else class="main-pane">
      <div v-if="subData.freeSeats">
        <h2 class="top-h2">Free Use</h2>
        Tuumik is free to use for teams with up to {{ subData.freeSeats }} seats. Each active account counts as a single seat. For larger teams Tuumik requires a subscription.
      </div>
      <h2>Start Subscription</h2>
      <div v-if="subData?.mainPaymentLinks.length" class="payments-holder">
        <SubscriptionsPlan v-for="mainPaymentLink in subData.mainPaymentLinks" :key="mainPaymentLink.url" :link="mainPaymentLink" />
      </div>
      <h2>Manage Subscriptions</h2>
      You can manage your subscriptions to Tuumik in our externally hosted Customer Portal.
      To sign into the Customer Portal you need access to the email address that is set up as the billing address for your subscription.
      In the Customer Portal you can view and download your invoices, change payment data, and update and cancel your subscriptions.<br>
      <a v-if="subData.stripeCustomerPortalUrl" :href="subData.stripeCustomerPortalUrl" target="_blank" class="btn-submit customer-portal-link">Open Customer Portal</a>
      <h2>Cancel Subscriptions</h2>
      You can cancel your subscription to Tuumik at any time in the Customer Portal.
      <h2>Automatic Subscription Updates</h2>
      Future versions of Tuumik will allow you to link your Tuumik deployment to your subscription so that changing the number of active accounts in Tuumik will automatically update your
      subscription quantity. This version of Tuumik does not support setting up such connection. You can update your subscription in the Customer Portal manually when necessary.
      <h2>External Access</h2>
      Information about billing in Tuumik and the link to the Customer Portal is also available on
      <a v-if="subData.tuumikBillingPortalUrl" :href="subData.tuumikBillingPortalUrl" target="_blank" class="rlink">{{ subData.tuumikBillingPortalUrl }}</a>.
      This is useful if you lose access to your Tuumik deployment for any reason.
      <h2>Support</h2>
      If you have any questions regarding your subscription or billing, please contact support@tuumik.com.
      <h2>Terminate Organization</h2>
      You can delete your account and all its data in Tuumik on the
      <RouterLink to="/admin/termination" class="rlink">
        Termination page.
      </RouterLink>
      Please note that this does not cancel any paid subscriptions you might have. You can cancel subscriptions in the Customer Portal linked above.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import SubscriptionsPlan from './components/SubscriptionsPlan.vue';

const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();

const loading = ref(true);
const subData = ref(null);

onMounted(() => {
  loadSubData();
});

async function loadSubData() {
  loading.value = true;
  const url = 'https://api.tuumik.com/v1/subscriptions/general';
  const options = { method: 'GET', mode: 'cors' };
  try {
    const res = await fetch(url, options);
    subData.value = await res.json();
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}
</script>

<style scoped>
.spinner-local {
  width: 2em;
  height: 2em;
}

.payments-holder {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 1em 0;
}

.customer-portal-link {
  color: #ffffff;
}
</style>
