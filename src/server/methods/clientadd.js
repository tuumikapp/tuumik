/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Clients } from '/src/shared/collections/collections.js';
import clientAdd from '/src/server/integrations/client-add.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

Meteor.methods({
  async clientInsert(name) {
    check(name, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.clientsEdit) throw new Meteor.Error('403', 'No permission to add clients');
    if (name.length < 2) throw new Meteor.Error('405', 'Client name must be at least 2 characters');

    const doc = {
      tenantId: user.tenantId,
      name,
      nameNormalized: normalizeStringForAC(name),
      reminder: '',
      created: new Date(),
      lastModified: new Date(),
    };

    const x = await Clients.insertAsync(doc);
    clientAdd({ name });
    return x;
  },
  async clientHistory() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.clientsEdit) throw new Meteor.Error('403', 'No permission to add clients');

    const res = await Clients.find(
      { tenantId: user.tenantId },
      {
        fields: { name: 1, created: 1 },
        sort: { created: -1 },
        limit: 10,
      },
    ).fetchAsync();

    return res;
  },
});
