/* Copyright (C) 2017-2023 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

Accounts.emailTemplates.siteName = 'Tuumik';
Accounts.emailTemplates.from = `Tuumik <${Meteor.settings.private.systemEmail}>`;

Accounts.emailTemplates.verifyEmail = {
  subject() {
    return 'Tuumik - verify email address';
  },
  html(user, url) {
    const urlWithoutHash = url.replace('#/', '');
    const str1 = `
    <!DOCTYPE html>
    <html>
    <head>
      <style type="text/css">
      .root-holder {
        background-color: #f7f7f7;
        padding: 2em 0;
        color: #444444;
      }
      .content-holder {
        margin: 0 auto;
        padding: 1em 2em 2em 2em;
        width: 40em;
        max-width: 70%;
        background-color: #ffffff;
        border-left: 1px solid #e3e3e3;
        border-right: 1px solid #e3e3e3;
      }
      .header-holder {
        margin: 0 auto;
        width: 40em;
        max-width: 70%;
        padding: 2em;
        background-color: #ffffff;
        border: 1px solid #e3e3e3;
        border-radius: 0.4em 0.4em 0 0;
        display: flex;
      }
      .header-logo {
        height: 3em;
        width: 3em;
        margin: 0 1em 0 0;
        background-image: url('https://assets.tuumik.com/logo/logo300.png');
        background-repeat: no-repeat;
        background-size: auto 99%;
        background-position: center center;
      }
      .header-name {
        height: 3em;
        line-height: 3em;
      }
      h1 {
        font-size: 1.6em;
        text-align: center;
        display: block;
        margin: 1em 0;
        padding: 0;
        color: #444444;
      }
      .top-text {
        margin: 1em 0;
        color: #444444;
        text-align: justify;
      }
      .footer-holder {
        margin: 0 auto;
        width: 40em;
        max-width: 70%;
        padding: 2em;
        background-color: #ffffff;
        border: 1px solid #e3e3e3;
        border-radius: 0 0 0.4em 0.4em;
      }
      .footer-item {
        color: #9f9f9f;
        margin: 0.3em 1em 0.3em 0;
      }
      .footer-item a {
        color: #9f9f9f;
      }
      </style>
    </head>
    <body>
    <div class="root-holder">
    <div class="header-holder">
      <div class="header-logo"></div>
      <div class="header-name">Tuumik</div>
    </div>
    <div class="content-holder">
    <h1>Email Verification</h1>
    <div class="top-text">
      You can verify your email address on Tuumik by visiting the following link:
      ${urlWithoutHash}
    </div>
    <div class="top-text">
      If you did not request the verification, please ignore this email.
    </div>
    </div>
    <div class="footer-holder">
      <div class="footer-item">Tuumik</div>
    </div>
    </div>
    </body>
    </html>
    `;
    return str1;
  },
  text(user, url) {
    const urlWithoutHash = url.replace('#/', '');
    return `You can verify your email address on Tuumik by visiting the following link:\n\n${urlWithoutHash}\n\n If you did not request the verification, please ignore this email.`;
  },
};

Accounts.emailTemplates.resetPassword = {
  subject() {
    return 'Tuumik - reset password';
  },
  html(user, url) {
    const urlWithoutHash = url.replace('#/', '');
    const str1 = `
    <!DOCTYPE html>
    <html>
    <head>
      <style type="text/css">
      .root-holder {
        background-color: #f7f7f7;
        padding: 2em 0;
        color: #444444;
      }
      .content-holder {
        margin: 0 auto;
        padding: 1em 2em 2em 2em;
        width: 40em;
        max-width: 70%;
        background-color: #ffffff;
        border-left: 1px solid #e3e3e3;
        border-right: 1px solid #e3e3e3;
      }
      .header-holder {
        margin: 0 auto;
        width: 40em;
        max-width: 70%;
        padding: 2em;
        background-color: #ffffff;
        border: 1px solid #e3e3e3;
        border-radius: 0.4em 0.4em 0 0;
        display: flex;
      }
      .header-logo {
        height: 3em;
        width: 3em;
        margin: 0 1em 0 0;
        background-image: url('https://assets.tuumik.com/logo/logo300.png');
        background-repeat: no-repeat;
        background-size: auto 99%;
        background-position: center center;
      }
      .header-name {
        height: 3em;
        line-height: 3em;
      }
      h1 {
        font-size: 1.6em;
        text-align: center;
        display: block;
        margin: 1em 0;
        padding: 0;
        color: #444444;
      }
      .top-text {
        margin: 1em 0;
        color: #444444;
        text-align: justify;
      }
      .footer-holder {
        margin: 0 auto;
        width: 40em;
        max-width: 70%;
        padding: 2em;
        background-color: #ffffff;
        border: 1px solid #e3e3e3;
        border-radius: 0 0 0.4em 0.4em;
      }
      .footer-item {
        color: #9f9f9f;
        margin: 0.3em 1em 0.3em 0;
      }
      .footer-item a {
        color: #9f9f9f;
      }
      </style>
    </head>
    <body>
    <div class="root-holder">
    <div class="header-holder">
      <div class="header-logo"></div>
      <div class="header-name">Tuumik</div>
    </div>
    <div class="content-holder">
    <h1>Password Reset</h1>
    <div class="top-text">
      You can reset your password on Tuumik by visiting the following link:
      ${urlWithoutHash}
    </div>
    <div class="top-text">
      If you did not request the reset, please ignore this email.
    </div>
    </div>
    <div class="footer-holder">
      <div class="footer-item">Tuumik</div>
    </div>
    </div>
    </body>
    </html>
    `;
    return str1;
  },
  text(user, url) {
    const urlWithoutHash = url.replace('#/', '');
    return `You can reset your password on Tuumik by visiting the following link:\n\n${urlWithoutHash}\n\n If you did not request the reset, please ignore this email.`;
  },
};
