/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { TaskGroups } from '/src/shared/collections/collections.js';

Meteor.methods({
  async getTaskGroups() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    const taskGroupsRes = await TaskGroups.find(
      { tenantId: user.tenantId },
      {
        fields: { name: 1, position: 1, showByDefault: 1, types: 1 },
        sort: { position: 1 },
      },
    ).fetchAsync();

    return taskGroupsRes;
  },
});
