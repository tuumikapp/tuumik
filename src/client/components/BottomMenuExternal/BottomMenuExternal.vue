<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="header-external">
    <div class="spacer"></div>
    <div class="menu-right">
      <div class="name-notice">© Tuumik Systems</div>
      <a href="https://www.tuumik.com" target="_blank" class="mlink">www.tuumik.com</a>
    </div>
  </div>
</template>

<style scoped>
.header-external {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3em;
  z-index: 1000;
  background-color: #00ab6a;
  border-top: 1px solid #00c076;
  color: #eeeeee;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.menu-right {
  display: flex;
  margin: 0;
  padding: 0 2em;
  list-style-type: none;
}

.name-notice {
  padding: 0 0.6em;
  line-height: 3em;
  display: inline-block;
}

.is-mobile .name-notice {
  line-height: 3.7em;
  font-size: 0.8em;
}

.mlink {
  padding: 0 0.6em;
  line-height: 3em;
  display: inline-block;
  text-decoration: none;
}

.is-mobile .mlink {
  line-height: 3.7em;
  font-size: 0.8em;
}

.mlink:hover {
  color: #ffffff;
}

.spacer {
  margin-left: auto;
}
</style>
