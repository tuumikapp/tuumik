<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div :style="planStyle()" class="payment-box">
    <div v-if="link.labelTop" :style="labelStyle()" class="payment-top-label">{{ link.labelTop.text }}</div>
    <div v-if="link.name" class="payment-name">{{ link.name }}</div>
    <div v-if="link.price1">
      <div class="payment-price-top">
        <span v-if="link.price1.currencyChar">{{ link.price1.currencyChar }}</span>
        <span v-if="link.price1.price">{{ link.price1.price }}</span>
        <span v-if="link.price1.currencyText">{{ link.price1.currencyText }}</span>
      </div>
      <div class="payment-price-bottom">
        <span v-if="link.price1.unit1">per </span>
        <span v-if="link.price1.unit1">{{ link.price1.unit1 }}</span>
        <span v-if="link.price1.unit2"> per </span>
        <span v-if="link.price1.unit2">{{ link.price1.unit2 }}</span>
      </div>
    </div>
    <div v-if="link.price2" class="payment-price2-holder">
      <span v-if="link.price2.currencyChar">{{ link.price2.currencyChar }}</span>
      <span v-if="link.price2.price">{{ link.price2.price }}</span>
      <span v-if="link.price2.currencyText">{{ link.price2.currencyText }}</span>
      <span v-if="link.price2.unit1"> per </span>
      <span v-if="link.price2.unit1">{{ link.price2.unit1 }}</span>
      <span v-if="link.price2.unit2"> per </span>
      <span v-if="link.price2.unit2">{{ link.price2.unit2 }}</span>
    </div>
    <div v-if="link.periodText" class="payment-period-text">{{ link.periodText }}</div>
    <a v-if="link.url" :href="link.url" target="_blank" class="btn-submit payment-start-link">START</a>
    <div v-if="link.text1" class="payment-text1">{{ link.text1 }}</div>
    <div v-if="link.text2" class="payment-text2">{{ link.text2 }}</div>
    <div v-if="link.text3" class="payment-text3">{{ link.text3 }}</div>
    <div v-if="link.text4" class="payment-text4">{{ link.text4 }}</div>
    <div v-if="link.textBottom1" class="payment-bottom-text1">{{ link.textBottom1 }}</div>
    <div v-if="link.textBottom2" class="payment-bottom-text2">{{ link.textBottom2 }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  link: { type: Object, required: true },
});

function planStyle() {
  const bgColor = props.link.bgColor || '#ffffff';
  const borderColor = props.link.borderColor || '#ffffff';
  return `background-color: ${bgColor}; border: 1px solid ${borderColor};`;
}

function labelStyle() {
  const bgColor = props.link.labelTop.bgColor || '#ffffff';
  const borderColor = props.link.labelTop.borderColor || '#ffffff';
  const color = props.link.labelTop.color || '#ffffff';
  return `background-color: ${bgColor}; border: 1px solid ${borderColor}; color: ${color};`;
}
</script>

<style scoped>
.payment-box {
  position: relative;
  width: 16em;
  margin: 0 0.5em 1em 0.5em;
  padding: 16.5em 1em 1em 1em;
  background-color: #fcefe3;
  border: 1px solid #c9c9c9;
  border-radius: 0.4em;
  text-align: center;
}

.payment-top-label {
  position: absolute;
  top: -0.4em;
  left: 0;
  right: 0;
  width: 70%;
  margin: 0 auto;
  padding: 0.2em 0;
  border-radius: 0.4em;
  background-color: #ffb833;
}

.payment-name {
  position: absolute;
  top: 1.8em;
  left: 0;
  right: 0;
}

.payment-price-top {
  position: absolute;
  top: 2.2em;
  left: 0;
  right: 0;
  font-weight: 600;
  font-size: 2em;
}

.payment-price-bottom {
  position: absolute;
  top: 7em;
  left: 0;
  right: 0;
  font-weight: 600;
}

.payment-price2-holder {
  position: absolute;
  top: 8.7em;
  left: 0;
  right: 0;
  color: #7f7f7f;
}

.payment-period-text {
  position: absolute;
  top: 10.5em;
  left: 0;
  right: 0;
}

.payment-start-link {
  position: absolute;
  top: 13em;
  left: 0;
  right: 0;
  margin: 0 auto;
  color: #ffffff;
  display: block;
  width: 70%;
  text-align: center;
}

.payment-text1 {
  position: absolute;
  top: 4em;
  left: 0;
  right: 0;
}

.payment-text2 {
  position: absolute;
  top: 6em;
  left: 0;
  right: 0;
}

.payment-text3 {
  position: absolute;
  top: 10em;
  left: 0;
  right: 0;
}

.payment-text4 {
  position: absolute;
  top: 12em;
  left: 0;
  right: 0;
}

.payment-bottom-text1 {
  margin: 1em 0 0 0;
  color: #7f7f7f;
}

.payment-bottom-text2 {
  font-weight: 600;
  margin: 1em 0 0 0;
}
</style>
