/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import postmark from 'postmark';
import { demoStartEmailHTML, demoStartEmailText } from '/src/server/email/templates/demo-start.js';
import { demoEndEmailHTML, demoEndEmailText } from '/src/server/email/templates/demo-end.js';

const serverToken = process.env.POSTMARK_MAIN_KEY;
const pmClient = serverToken ? new postmark.ServerClient(serverToken) : undefined;
const { systemEmail, monitorEmail } = Meteor.settings.private;

export const sendDefaultEmail = async reqData => {
  if (!serverToken || !systemEmail) return false;
  const res = await pmClient.sendEmail({
    From: systemEmail,
    To: reqData.to,
    Subject: reqData.subject,
    HtmlBody: reqData.html,
    TextBody: reqData.text,
  });
  return res;
};

export const sendDemoStartEmail = async reqData => {
  if (!serverToken || !systemEmail) return false;
  const res = await pmClient.sendEmail({
    From: systemEmail,
    To: reqData.to,
    Subject: 'Tuumik Demo Created',
    HtmlBody: demoStartEmailHTML(reqData),
    TextBody: demoStartEmailText(reqData),
  });
  return res;
};

export const sendDemoEndEmail = async reqData => {
  if (!serverToken || !systemEmail) return false;
  const res = await pmClient.sendEmail({
    From: systemEmail,
    To: reqData.to,
    Subject: 'Tuumik Demo Expired',
    HtmlBody: demoEndEmailHTML(reqData),
    TextBody: demoEndEmailText(reqData),
  });
  return res;
};

export const sendMonitoringEmail = async reqData => {
  if (!serverToken || !systemEmail || !monitorEmail) return false;
  const res = await pmClient.sendEmail({
    From: systemEmail,
    To: monitorEmail,
    Subject: reqData.subject,
    TextBody: reqData.textBody,
  });
  return res;
};
