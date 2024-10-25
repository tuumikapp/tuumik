/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import removeTenantData from '/src/server/termination/remove-tenant-data.js';

Meteor.methods({
  async terminateTenant(password) {
    check(password, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    if (!Meteor.settings.private.tenantDeletionByTenant) throw new Meteor.Error('403', 'Tenant deletion not allowed by server configuration. Please contact your administrator.');
    if (!password || password !== Meteor.settings.private.tenantDeletionPassword) throw new Meteor.Error('401', 'Incorrect tenant deletion password');

    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');

    try {
      await removeTenantData(user.tenantId);
    } catch (error) {
      throw new Meteor.Error('403', 'Tenant termination failed');
    }
  },
});
