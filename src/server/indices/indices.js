/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { TaskGroups, Times, Statuses, Clients, Projects } from '/src/shared/collections/collections.js';

export default function() {
  Meteor.users.rawCollection().createIndex({ tenantId: 1 });
  Meteor.users.rawCollection().createIndex({ nameNormalized: 1 });

  TaskGroups.rawCollection().createIndex({ tenantId: 1 });

  Times.rawCollection().createIndex({ tenantId: 1, date: 1, owner: 1 });
  Times.rawCollection().createIndex({ taskDescNormalized: 1 });

  Statuses.rawCollection().createIndex({ tenantId: 1, start: 1, userId: 1 });

  Clients.rawCollection().createIndex({ tenantId: 1 });
  Clients.rawCollection().createIndex({ nameNormalized: 1 });

  Projects.rawCollection().createIndex({ tenantId: 1 });
  Projects.rawCollection().createIndex({ nameNormalized: 1 });
}
