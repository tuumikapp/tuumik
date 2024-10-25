/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Times, Clients, Projects, Statuses } from '/src/shared/collections/collections.js';

Meteor.methods({
  async userMonitorLoad(dates, userId) {
    check(dates, Object);
    check(userId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    const targetUserId = userId && user.permissions.monitor ? userId : this.userId;
    const targetUser = await Meteor.users.findOneAsync(
      { tenantId: user.tenantId, _id: targetUserId },
      {
        fields: { name: 1, inOutStatus: 1, inOutUpdateAt: 1, pic: 1 },
      },
    );

    const statusesRes = await Statuses.find(
      {
        tenantId: user.tenantId,
        $or: [
          { start: { $gt: dates.startLocal, $lt: dates.endLocal } },
          { end: { $gt: dates.startLocal, $lt: dates.endLocal } },
          { start: { $lt: dates.startLocal }, end: { $gt: dates.endLocal } },
        ],
        userId: targetUserId,
      },
      {
        fields: {
          userId: 1,
          status: 1,
          start: 1,
          end: 1,
        },
      },
    ).fetchAsync();

    const timesRes = await Times.find(
      {
        tenantId: user.tenantId,
        owner: targetUserId,
        date: { $gt: dates.startUTC, $lt: dates.endUTC },
      },
      {
        fields: {
          date: 1,
          owner: 1,
          startMinute: 1,
          endMinute: 1,
          plan: 1,
          taskType: 1,
          taskDesc: 1,
          projectId: 1,
          useTaskType: 1,
          intCom: 1,
          lastModified: 1,
        },
        sort: { date: -1, lastModified: -1 },
      },
    ).fetchAsync();

    // join projects for times
    const projectIds1 = [...new Set(timesRes.map(time => time.projectId))].sort();
    const projectsRes1 = await Projects.find({ tenantId: user.tenantId, _id: { $in: projectIds1 } }, { fields: { name: 1, clientId: 1 } }).fetchAsync();
    const timesWithProjectsJoined = timesRes.map(time => {
      const x = time;
      const projectDoc = projectsRes1.find(project => project._id === time.projectId);
      if (projectDoc?.name) x.projectName = projectDoc.name;
      if (projectDoc?.clientId) x.clientId = projectDoc.clientId;
      return x;
    });
    // /join projects for times

    // join clients for times
    const clientIds1 = [...new Set(timesWithProjectsJoined.map(time => time.clientId))].sort();
    const clientsRes1 = await Clients.find({ tenantId: user.tenantId, _id: { $in: clientIds1 } }, { fields: { name: 1 } }).fetchAsync();
    const timesWithClientsJoined = timesRes.map(time => {
      const x = time;
      const clientDoc = clientsRes1.find(client => client._id === time.clientId);
      if (clientDoc?.name) x.clientName = clientDoc.name;
      if (x.clientId) x.clientId = null;
      return x;
    });
    // /join clients for times

    return {
      targetUser,
      statuses: statusesRes,
      times: timesWithClientsJoined,
      dates,
    };
  },
});
