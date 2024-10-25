/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Clients, Projects, Times } from '/src/shared/collections/collections.js';

Meteor.methods({
  async getClientForView(clientId) {
    check(clientId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    const clientRes = await Clients.findOneAsync(
      { tenantId: user.tenantId, _id: clientId },
      {
        fields: {
          name: 1,
          reminder: 1,
          tel: 1,
          email: 1,
          address: 1,
          created: 1,
          lastModified: 1,
        },
      },
    );

    if (!clientRes) throw new Meteor.Error('404', 'Specified client not found');
    return { client: clientRes };
  },
  async getProjectsForClientView(clientId) {
    check(clientId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    const projectsRes = await Projects.find(
      { tenantId: user.tenantId, clientId },
      {
        fields: { name: 1, created: 1 },
        sort: { created: 1 },
      },
    ).fetchAsync();

    return { projects: projectsRes };
  },
  async getTimesForClientView(clientId) {
    check(clientId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.composer) throw new Meteor.Error('403', 'No permission to access tasks');

    const clientProjects = await Projects.find({ tenantId: user.tenantId, clientId }).fetchAsync();
    const allProjectIds = clientProjects.map(project => project._id);

    const limit = 20;
    const query = {
      tenantId: user.tenantId,
      projectId: { $in: allProjectIds },
    };

    if (!user.permissions.historyOthers) query.owner = user._id;
    if (!user.permissions.composer) query.hideHistory = { $ne: true };

    const timesRes = await Times.find(query, {
      fields: {
        date: 1,
        owner: 1,
        startMinute: 1,
        endMinute: 1,
        taskType: 1,
        taskDesc: 1,
        projectId: 1,
        useTaskType: 1,
        lastModified: 1,
      },
      sort: { date: -1, lastModified: -1 },
      limit,
    }).fetchAsync();

    // join projects and owners
    const projectIds = [...new Set(timesRes.map(time => time.projectId))].sort();
    const projectsRes = await Projects.find({ tenantId: user.tenantId, _id: { $in: projectIds } }, { fields: { name: 1 } }).fetchAsync();
    const ownerIds = [...new Set(timesRes.map(time => time.owner))].sort();
    const ownersRes = await Meteor.users.find({ tenantId: user.tenantId, _id: { $in: ownerIds } }, { fields: { name: 1 } }).fetchAsync();
    const timesWithJoins = timesRes.map(time => {
      const x = time;
      const projectDoc = projectsRes.find(project => project._id === time.projectId);
      if (projectDoc?.name) x.projectName = projectDoc.name;
      const ownerDoc = ownersRes.find(owner => owner._id === time.owner);
      if (ownerDoc?.name) x.ownerName = ownerDoc.name;
      return x;
    });
    // /join projects and owners

    return timesWithJoins;
  },
});
