/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import postmark from 'postmark';

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
