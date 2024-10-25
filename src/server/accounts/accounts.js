/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Tenants } from '/src/shared/collections/collections';

Accounts.config({
  forbidClientAccountCreation: true,
  sendVerificationEmail: false,
  loginExpirationInDays: 90,
  passwordResetTokenExpirationInDays: 2,
});

Accounts.onCreateUser((options, user) => {
  const userDoc = user;
  // move custom fields from the default profile field to top level fields
  if (options.profile.tenantId) userDoc.tenantId = options.profile.tenantId;
  if (options.profile.name) userDoc.name = options.profile.name;
  if (options.profile.nameNormalized) userDoc.nameNormalized = options.profile.nameNormalized;
  if (options.profile.permissions) userDoc.permissions = options.profile.permissions;
  if (options.profile.inOutStatus) userDoc.inOutStatus = options.profile.inOutStatus;
  if (options.profile.inTeams) userDoc.inTeams = options.profile.inTeams;
  if (options.profile.pic) userDoc.pic = options.profile.pic;
  if (options.profile.allowedIpAddresses) userDoc.allowedIpAddresses = options.profile.allowedIpAddresses;

  userDoc.trackerSimple = options.profile.trackerSimple || true;
  userDoc.defaultClientId = '';
  userDoc.defaultProjectId = '';
  userDoc.inOutShow = true;
  if (!userDoc.inOutStatus) userDoc.inOutStatus = '1';
  userDoc.inOutNote = '';
  userDoc.inOutETA = '';
  userDoc.inOutUpdateAt = new Date();
  userDoc.inOutUpdateById = '';
  userDoc.inOutUpdateByName = '';
  if (!userDoc.inTeams) userDoc.inTeams = [];
  if (!userDoc.pic) userDoc.pic = '';
  userDoc.disabled = false;
  userDoc.created = new Date();

  return userDoc;
});

Accounts.validateLoginAttempt(async (attempt) => {
  if (!attempt.user || attempt.user.disabled) throw new Meteor.Error('404', 'User not found');

  const tenant = await Tenants.findOneAsync(attempt.user.tenantId);
  if (!tenant) throw new Meteor.Error('403', 'Tenant information could not be retreived');

  if (tenant.preventLogin) throw new Meteor.Error('403', 'Login disabled. Please contact support');

  if (attempt.allowed) return true;
  return false;
});
