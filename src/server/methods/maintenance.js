/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import normalizeStringForAC from '/src/shared/utils/normalization.js';
import { Global, Tenants, Times, Statuses, Clients, Projects, TaskGroups } from '/src/shared/collections/collections.js';
import removeTenantData from '/src/server/termination/remove-tenant-data.js';

Meteor.methods({
  // GLOBAL
  async tmk11(password, allowSignup) {
    // Meteor.call('tmk11', 'psw', true, (err, res) => { console.log(res); });
    check(password, String);
    check(allowSignup, Boolean);

    if (!password || password !== Meteor.settings.private.maintenancePassword) throw new Meteor.Error('401', 'Incorrect input');

    await Global.updateAsync({}, { $set: { allowSignup } });

    return {
      action: 'Updated signup settings',
      allowSignup,
    };
  },
  async tmk12(password, signupCode) {
    // Meteor.call('tmk12', 'psw', 'code', (err, res) => { console.log(res); });
    check(password, String);
    check(signupCode, String);

    if (!password || password !== Meteor.settings.private.maintenancePassword) throw new Meteor.Error('401', 'Incorrect input');

    await Global.updateAsync({}, { $set: { signupCode } });

    return {
      action: 'Updated signup code',
      signupCode,
    };
  },
  // /GLOBAL

  // GENERAL INFO
  async tmk21(password) {
    // Meteor.call('tmk21', 'psw', (err, res) => { console.log(res); });
    check(password, String);

    if (!password || password !== Meteor.settings.private.maintenancePassword) throw new Meteor.Error('401', 'Incorrect input');

    const tenants = await Tenants.find(
      {},
      {
        fields: {
          name: 1,
          createdAt: 1,
          composerExporters: 1,
          composerExportersBack: 1,
        },
      },
    ).fetchAsync();

    return {
      action: 'List tenants',
      tenantCount: tenants.length,
      tenants: tenants,
    };
  },
  async tmk22(password, tenantId) {
    // Meteor.call('tmk22', 'psw', 'tenantId', (err, res) => { console.log(res); });
    check(password, String);
    check(tenantId, String);

    if (!password || password !== Meteor.settings.private.maintenancePassword) {
      throw new Meteor.Error('401', 'Incorrect input');
    }

    const tenant = await Tenants.findOneAsync(tenantId);
    if (!tenant) throw new Meteor.Error('401', 'No tenant found with specified id');

    const users = await Meteor.users.find(
      { tenantId },
      {
        fields: { name: 1, username: 1, created: 1, disabled: 1 },
        sort: { disabled: 1, name: 1 },
      },
    ).fetchAsync();

    return {
      action: 'List users under tenant',
      tenantId,
      userCount: users.length,
      users: users,
    };
  },
  // /GENERAL INFO

  // USERS
  async tmk31(password, tenantId) {
    // Meteor.call('tmk31', 'psw', 'tenantId', (err, res) => { console.log(res); });
    check(password, String);
    check(tenantId, String);

    if (!password || password !== Meteor.settings.private.maintenancePassword) {
      throw new Meteor.Error('401', 'Incorrect input');
    }

    const tenant = await Tenants.findOneAsync(tenantId);
    if (!tenant) throw new Meteor.Error('401', 'No tenant found with specified id');

    const name = 'Maintenance Admin';
    const username = String(Math.floor(Math.random() * 100000000 + 100000000));
    const psw = String(Math.floor(Math.random() * 10000000000 + 10000000000));
    const permissions = {
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
      name,
      nameNormalized: normalizeStringForAC(name),
      permissions,
    };
    const userId = Accounts.createUser({ username, password: psw, profile });

    return {
      action: 'Maintenance user created',
      tenantId,
      userId,
      username,
      password: psw,
    };
  },
  async tmk32(password, userId) {
    // Meteor.call('tmk32', 'psw', 'userId', (err, res) => { console.log(res); });
    check(password, String);
    check(userId, String);

    if (!password || password !== Meteor.settings.private.maintenancePassword) {
      throw new Meteor.Error('401', 'Incorrect input');
    }

    const user = await Meteor.users.findOneAsync(userId);
    if (!user) throw new Meteor.Error('401', 'No user found with specified id');

    const psw = String(Math.floor(Math.random() * 10000000000 + 10000000000));
    Accounts.setPassword(userId, psw, { logout: true });

    return {
      action: 'User password changed',
      tenantId: user.tenantId,
      userId,
      username: user.username,
      password: psw,
    };
  },
  // /USERS

  // TENANT DELETION
  async tmk100(password, tenantId, tenantName) {
    // Meteor.call('tmk100', 'psw', 'tenantId', 'tenantName', (err, res) => { console.log(res); });
    check(password, String);
    check(tenantId, String);
    check(tenantName, String);

    const { tenantDeletionPassword } = Meteor.settings.private;
    if (!password || password !== tenantDeletionPassword) throw new Meteor.Error('401', 'Incorrect input');

    const tenant = await Tenants.findOneAsync(tenantId);
    if (!tenant) throw new Meteor.Error('401', 'No tenant found with specified id');

    if (tenantName !== tenant.name) throw new Meteor.Error('401', 'Tenant name does not match');

    removeTenantData(tenant._id);

    return {
      action: 'Tenant deleted',
      tenantId: tenant._id,
      tenantName: tenant.name,
      times: await Times.find({ tenantId }).countAsync(),
      statuses: await Statuses.find({ tenantId }).countAsync(),
      clients: await Clients.find({ tenantId }).countAsync(),
      projects: await Projects.find({ tenantId }).countAsync(),
      taskGroups: await TaskGroups.find({ tenantId }).countAsync(),
      users: await Meteor.users.find({ tenantId }).countAsync(),
      tenants: await Tenants.find({ _id: tenantId }).countAsync(),
    };
  },
  // /TENANT DELETION
});
