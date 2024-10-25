/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';

Meteor.publish('usersSelf', async function() {
  if (!this.userId) {
    return this.ready();
  }

  const user = await Meteor.users.findOneAsync(this.userId);
  return Meteor.users.find(
    { tenantId: user.tenantId, _id: user._id },
    {
      fields: {
        tenantId: 1,
        name: 1,
        emails: 1,
        trackerSimple: 1,
        defaultClientId: 1,
        defaultProjectId: 1,
        inOutStatus: 1,
        inOutNote: 1,
        permissions: 1,
        pic: 1,
      },
    },
  );
});
