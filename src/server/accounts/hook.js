/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Email } from 'meteor/email';
import { sendDefaultEmail } from '/src/server/email/api.js';

// Meteor's Accounts package by default uses Meteor's Email package to send accounts related emails
// such as email verification and password reset links. The below patch makes those emails use
// the API in /src/server/email/api.js instead. By default this API is set up to use Postmark.

Email.send = args => {
  sendDefaultEmail(args);
};
