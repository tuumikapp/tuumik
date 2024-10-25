/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Tenants } from '/src/shared/collections/collections.js';

Meteor.publish('tenant', async function() {
  if (!this.userId) {
    return this.ready();
  }

  const user = await Meteor.users.findOneAsync(this.userId);
  return Tenants.find(
    { _id: user.tenantId },
    {
      fields: {
        name: 1,
        numberFormat: 1,
        dateFormat: 1,
        timeFormat: 1,
        weekStart: 1,
        thouMark: 1,
        decimalMark: 1,
        currency: 1,
        useTaskTypesByDefault: 1,
        trackerStep: 1,
        teams: 1,
        composerExportersFront: 1,
        homeView: 1,
        inOutOptions: 1,
      },
    },
  );
});
