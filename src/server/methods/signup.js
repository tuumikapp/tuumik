/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';
import { Global, Tenants } from '/src/shared/collections/collections.js';
import inOutOptions from '/src/server/initdata/inout-options.js';
import insertInitialTaskGroups from '/src/server/initdata/taskgroups.js';
import { isValidEmailAddress, isValidPhoneNumber } from '/src/server/utils/validation';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

Meteor.methods({
  async insertTenantAndUser(args) {
    check(args, Object);
    check(args.tenant, Object);
    check(args.user, Object);
    check(args.tenant.name, String);
    check(args.tenant.email, String);
    check(args.tenant.phone, String);
    check(args.user.name, String);
    check(args.user.email, String);
    check(args.password, Object);
    check(args.signupCode, String);

    if (Meteor.settings.public.demoMode) throw new Meteor.Error('403', 'Signup not allowed');
    const global = await Global.findOneAsync();
    if (!global.allowSignup) throw new Meteor.Error('403', 'Signup not allowed');
    if (global.signupCode && !args.signupCode) throw new Meteor.Error('403', 'Signup code required');
    if (global.signupCode !== args.signupCode) throw new Meteor.Error('403', 'Incorrect signup code');
    if (!isValidEmailAddress(args.tenant.email)) throw new Meteor.Error('403', 'Unrecognized email format (organization)');
    if (!isValidPhoneNumber(args.tenant.phone)) throw new Meteor.Error('403', 'Unrecognized telephone number format (organization)');
    if (!isValidEmailAddress(args.user.email)) throw new Meteor.Error('403', 'Unrecognized email format (user)');

    const initialTeams = [
      { name: 'Team 1', id: '10' },
      { name: 'Team 2', id: '11' },
    ];

    const tenantId = await Tenants.insertAsync({
      name: args.tenant.name,
      email: args.tenant.email,
      phone: args.tenant.phone,
      dateFormat: 'DD.MM.YYYY',
      timeFormat: 'HH:mm',
      weekStart: 'mon',
      thouMark: 'comma',
      decimalMark: 'period',
      currency: { str: 'EUR', sign: '€' },
      useTaskTypesByDefault: false,
      trackerStep: 1,
      inOutOptions,
      teams: initialTeams,
      homeView: 'default',
      composerExportersFront: [],
      composerExportersBack: [],
      preventLogin: false,
      createdAt: new Date(),
    });

    await insertInitialTaskGroups(tenantId);

    const permissionsForFirstUser = {
      timeTracker: true,
      historyOthers: true,
      catalog: true,
      monitor: true,
      clientsEdit: true,
      projectsEdit: true,
      composer: true,
      inOutSelf: true,
      inOutView: true,
      inOutEditOthers: true,
      admin: true,
    };

    const profile = {
      tenantId,
      name: args.user.name,
      nameNormalized: normalizeStringForAC(args.user.name),
      permissions: permissionsForFirstUser,
    };

    const userId = await Accounts.createUserAsync({
      email: args.user.email,
      password: args.password,
      profile,
    });

    await Tenants.updateAsync(tenantId, {
      $set: {
        originalSignupData: {
          tenant: {
            name: args.tenant.name,
            email: args.tenant.email,
            phone: args.tenant.phone,
          },
          user: {
            userId,
            name: args.user.name,
            email: args.user.email,
          },
        },
      },
    });

    if (Meteor.settings.private.disableSignupAfterSignup) await Global.updateAsync({}, { $set: { allowSignup: false } });
  },
  async resendEmailVerificationLink() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    await Accounts.sendVerificationEmail(this.userId);
  },
  async sendEmailResetLink(email) {
    check(email, String);

    if (!isValidEmailAddress(email)) throw new Meteor.Error('405', 'Unrecognized email format');
    const user = await Accounts.findUserByEmail(email);
    if (!user) throw new Meteor.Error('401', 'Email not found');
    await Accounts.sendResetPasswordEmail(user._id);
  },
  async loadSignupSettings() {
    const global = await Global.findOneAsync();
    const res = {
      allowSignup: global.allowSignup,
      requireSignupCode: !!global.signupCode,
    };
    return res;
  },
});
