<!-- Copyright (C) 2017-2024 Tuumik Systems OÜ -->

<template>
  <div class="loginbody">
    <RouterLink to="/">
      <div class="loginlink">
        <span class="login-out">LOGGED OUT</span>
        <span class="login-in">LOG IN</span>
      </div>
    </RouterLink>
  </div>
</template>

<style scoped>
.loginbody {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  font-family: 'Source Sans Pro', Helvetica, Arial, Verdana, sans-serif;
  font-weight: 400;
  font-size: 16px;
  color: #eeeeee;
}

.loginlink {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  height: 14em;
  width: 14em;
  background-color: #00ab6a;
  border: 1px dashed #eeeeee;
  border-radius: 50%;
  transition: transform 300ms ease;
  text-align: center;
  overflow: hidden;
}

.loginlink span {
  position: absolute;
  right: 0;
  left: 0;
  height: 1em;
  margin: auto;
  transition: transform 300ms ease;
}

.login-out {
  top: 4em;
}

.login-in {
  bottom: -4em;
}

.loginlink:hover {
  transform: scale(1.1, 1.1);
}

.loginlink:hover span {
  transform: translateY(-8em);
}
</style>
