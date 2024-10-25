/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Times } from '/src/shared/collections/collections.js';

Meteor.publish('timesOnDate', async function(selDate) {
  check(selDate, Date);

  if (!this.userId) {
    return this.ready();
  }

  const user = await Meteor.users.findOneAsync(this.userId);
  return Times.find(
    { tenantId: user.tenantId, date: selDate, owner: user._id },
    {
      fields: {
        date: 1,
        owner: 1,
        startMinute: 1,
        endMinute: 1,
        plan: 1,
        clientId: 1,
        projectId: 1,
        taskType: 1,
        taskDesc: 1,
        useTaskType: 1,
        hideHistory: 1,
        intCom: 1,
      },
    },
  );
});
