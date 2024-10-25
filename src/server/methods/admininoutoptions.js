/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Tenants } from '/src/shared/collections/collections.js';

Meteor.methods({
  async loadInOutOptions() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');

    const res = await Tenants.findOneAsync({ _id: user.tenantId }, { fields: { inOutOptions: 1 } });
    return res.inOutOptions;
  },
  async saveInOutOptions(inOutOptions) {
    check(inOutOptions, Array);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');

    const tenant = await Tenants.findOneAsync(user.tenantId);
    let idCounter = Number.parseInt(tenant.inOutOptionsIdCounter, 10) || 10;
    const optionsProcessed = inOutOptions.map(opt => {
      if (opt.id) return { ...opt };
      idCounter += 1;
      return { ...opt, id: String(idCounter) };
    });
    await Tenants.updateAsync(
      { _id: user.tenantId },
      {
        $set: {
          inOutOptions: optionsProcessed,
          inOutOptionsIdCounter: idCounter,
        },
      },
    );
    const res = await Meteor.callAsync('loadInOutOptions');
    return res;
  },
});
