/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { isValidEmailAddress } from '/src/server/utils/validation';
import { Tenants } from '/src/shared/collections/collections.js';
import insertDemoTenant from '/src/server/demodata/tenant.js';
import insertDemoAccounts from '/src/server/demodata/accounts.js';
import insertDemoClients from '/src/server/demodata/clients.js';
import insertDemoProjects from '/src/server/demodata/projects.js';
import insertDemoTimes from '/src/server/demodata/times.js';
import insertDemoStatuses from '/src/server/demodata/statuses.js';
import insertInitialTaskGroups from '/src/server/initdata/taskgroups.js';
import { sendDemoStartEmail } from '/src/server/email/api.js';

dayjs.extend(utc);

Meteor.methods({
  async insertDemoData(email) {
    check(email, String);

    if (!Meteor.settings.public.demoMode) throw new Meteor.Error('403', 'Data can only be inserted in demo mode');
    if (!isValidEmailAddress(email)) throw new Meteor.Error('403', 'Unrecognized email format');
    if (this.userId) throw new Meteor.Error('403', 'Already logged in');

    const startDate = dayjs
      .utc()
      .subtract(24, 'hours')
      .toDate();
    const demoCount = await Tenants.find({ demo: true, createdAt: { $gt: startDate } }, { fields: { createdAt: 1 } }).countAsync();

    if (demoCount > 60) throw new Meteor.Error('403', 'Daily demos exceeded. Please try later.');

    const tenantId = await insertDemoTenant(email);
    await insertInitialTaskGroups(tenantId);
    await insertDemoAccounts(tenantId);
    await insertDemoClients(tenantId);
    await insertDemoProjects(tenantId);
    await insertDemoTimes(tenantId);
    await insertDemoStatuses(tenantId);

    const users = await Meteor.users.find({ tenantId }, { fields: { name: 1, emails: 1 }, sort: { name: 1 } }).fetchAsync();
    const reqData = {};
    reqData.to = email;
    reqData.users = users;
    const isProd = process.env.DEPLOY_CONFIG === 'production' || false;
    if (isProd) await sendDemoStartEmail(reqData);

    const oneUser = await Meteor.users.findOneAsync({ tenantId });
    return oneUser.emails[0].address;
  },
});
