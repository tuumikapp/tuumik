/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Clients, Projects } from '/src/shared/collections/collections.js';

Meteor.methods({
  async catalogClients() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.catalog) throw new Meteor.Error('403', 'No permission to access catalog');

    const res = await Clients.find({ tenantId: user.tenantId }, { fields: { name: 1 }, sort: { name: 1 } }).fetchAsync();

    return res;
  },
  async catalogProjectsForClient(clientId) {
    check(clientId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.catalog) throw new Meteor.Error('403', 'No permission to access catalog');

    const res = await Projects.find({ tenantId: user.tenantId, clientId }, { fields: { name: 1, created: 1 }, sort: { created: 1 } }).fetchAsync();

    return res;
  },
});
