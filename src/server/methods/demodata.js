/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Tenants } from '/src/shared/collections/collections.js';
import insertDemoTenant from '/src/server/demodata/tenant.js';
import insertDemoAccounts from '/src/server/demodata/accounts.js';
import insertDemoClients from '/src/server/demodata/clients.js';
import insertDemoProjects from '/src/server/demodata/projects.js';
import insertDemoTimes from '/src/server/demodata/times.js';
import insertDemoStatuses from '/src/server/demodata/statuses.js';
import insertInitialTaskGroups from '/src/server/initdata/taskgroups.js';
import removeTenantData from '/src/server/termination/remove-tenant-data.js';

Meteor.methods({
  async createDemo() {
    if (!Meteor.settings.public.demoMode) throw new Meteor.Error('403', 'App is not running in demo mode');
    if (this.userId) throw new Meteor.Error('403', 'Cannot create demo when logged in');

    // delete old demo data
    const demoTenants = await Tenants.find({ demo: true }, { fields: { createdAt: 1 }, sort: { createdAt: 1 } }).fetchAsync();
    const keepCount = 20;
    if (demoTenants.length > keepCount) {
      const demoTenantsToRemove = demoTenants.slice(0, -keepCount);
      for (const x of demoTenantsToRemove) {
        await removeTenantData(x._id);
      }
    }
    // /delete old demo data

    const tenantId = await insertDemoTenant();
    await insertInitialTaskGroups(tenantId);
    await insertDemoAccounts(tenantId);
    await insertDemoClients(tenantId);
    await insertDemoProjects(tenantId);
    await insertDemoTimes(tenantId);
    await insertDemoStatuses(tenantId);

    const oneUser = await Meteor.users.findOneAsync({ tenantId });
    return oneUser.emails[0].address;
  },
});
