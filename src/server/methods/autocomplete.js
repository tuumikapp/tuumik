/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Clients, Projects } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

Meteor.methods({
  async autocompleteClients(searchString) {
    check(searchString, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    const escaped = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const normalized = normalizeStringForAC(escaped);
    const searchQuery = new RegExp(normalized);

    const res = await Clients.find(
      {
        tenantId: user.tenantId,
        nameNormalized: searchQuery,
        $or: [{ hidden: { $ne: true } }, { allowAccess: { $in: [this.userId] } }],
      },
      { fields: { name: 1 }, limit: 15 },
    ).fetchAsync();
    return res;
  },
  async autocompleteProjects(searchString) {
    check(searchString, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    const escaped = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const normalized = normalizeStringForAC(escaped);
    const searchQuery = new RegExp(normalized);

    const res = await Projects.find(
      {
        tenantId: user.tenantId,
        nameNormalized: searchQuery,
        $or: [{ hidden: { $ne: true } }, { allowAccess: { $in: [this.userId] } }],
      },
      { fields: { name: 1 }, limit: 15 },
    ).fetchAsync();
    return res;
  },
  async autocompleteUsers(searchString) {
    check(searchString, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    const escaped = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const normalized = normalizeStringForAC(escaped);
    const searchQuery = new RegExp(normalized);

    const res = await Meteor.users.find({ tenantId: user.tenantId, nameNormalized: searchQuery }, { fields: { name: 1 }, limit: 15 }).fetchAsync();
    return res;
  },
});
