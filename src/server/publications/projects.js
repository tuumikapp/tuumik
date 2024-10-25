/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Projects } from '/src/shared/collections/collections.js';

Meteor.publish('projectForTime', async function(projectId) {
  check(projectId, String);

  if (!this.userId) {
    return this.ready();
  }

  const user = await Meteor.users.findOneAsync(this.userId);
  return Projects.find(
    { tenantId: user.tenantId, _id: projectId },
    {
      fields: {
        name: 1,
        clientId: 1,
        useTaskTypes: 1,
        taskGroupIds: 1,
        reminder: 1,
        open: 1,
      },
    },
  );
});

Meteor.publish('projectsForClientInTime', async function(clientId) {
  check(clientId, String);

  if (!this.userId) {
    return this.ready();
  }

  const user = await Meteor.users.findOneAsync(this.userId);
  return Projects.find(
    { tenantId: user.tenantId, clientId },
    {
      fields: {
        name: 1,
        clientId: 1,
        created: 1,
        open: 1,
      },
    },
  );
});
