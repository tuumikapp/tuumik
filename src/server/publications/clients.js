/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Clients } from '/src/shared/collections/collections.js';

Meteor.publish('clientForTime', async function(clientId) {
  check(clientId, String);

  if (!this.userId) {
    return this.ready();
  }

  const user = await Meteor.users.findOneAsync(this.userId);
  return Clients.find(
    { tenantId: user.tenantId, _id: clientId },
    {
      fields: {
        name: 1,
        reminder: 1,
      },
    },
  );
});
