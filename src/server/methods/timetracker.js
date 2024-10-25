/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Times, Projects, Clients } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

Meteor.methods({
  async timeHistoryClearSelf(timeId, limit) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    check(timeId, String);
    check(limit, Number);

    if (limit > 200) {
      throw new Meteor.Error('100', 'Query limit exceeded');
    }

    const timesRes = await Times.find(
      {
        tenantId: user.tenantId,
        owner: user._id,
        projectId: { $exists: true },
        hideHistory: { $ne: true },
        _id: { $ne: timeId },
      },
      {
        fields: {
          date: 1,
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
      },
    ).fetchAsync();

    // join projects
    const projectIds = [...new Set(timesRes.map(time => time.projectId))].sort();
    const projectsRes = await Projects.find({ tenantId: user.tenantId, _id: { $in: projectIds } }, { fields: { name: 1, clientId: 1 } }).fetchAsync();
    const timesWithProjectsJoined = timesRes.map(time => {
      const x = time;
      const projectDoc = projectsRes.find(project => project._id === time.projectId);
      if (projectDoc?.name) x.projectName = projectDoc.name;
      if (projectDoc?.clientId) x.clientId = projectDoc.clientId;
      return x;
    });
    // /join projects

    // join clients
    const clientIds = [...new Set(timesWithProjectsJoined.map(time => time.clientId))].sort();
    const clientsRes = await Clients.find({ tenantId: user.tenantId, _id: { $in: clientIds } }, { fields: { name: 1 } }).fetchAsync();
    const timesWithClientsJoined = timesRes.map(time => {
      const x = time;
      const clientDoc = clientsRes.find(client => client._id === time.clientId);
      if (clientDoc?.name) x.clientName = clientDoc.name;
      if (x.clientId) x.clientId = null;
      return x;
    });
    // /join clients

    return timesWithClientsJoined;
  },
  async timeHistoryProjectSelf(timeId, projectId, limit) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    check(timeId, String);
    check(projectId, String);
    check(limit, Number);

    if (limit > 200) {
      throw new Meteor.Error('100', 'Query limit exceeded');
    }

    const timesRes = await Times.find(
      {
        tenantId: user.tenantId,
        owner: user._id,
        projectId,
        hideHistory: { $ne: true },
        _id: { $ne: timeId },
      },
      {
        fields: {
          date: 1,
          startMinute: 1,
          endMinute: 1,
          taskType: 1,
          taskDesc: 1,
          useTaskType: 1,
          lastModified: 1,
        },
        sort: { date: -1, lastModified: -1 },
        limit,
      },
    ).fetchAsync();

    return timesRes;
  },
  async timeHistoryProjectOthers(projectId, limit) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    if (!user.permissions.historyOthers) {
      throw new Meteor.Error('100', 'No permission to view task history of other users');
    }

    check(projectId, String);
    check(limit, Number);

    if (limit > 200) {
      throw new Meteor.Error('100', 'Query limit exceeded');
    }

    const timesRes = await Times.find(
      {
        tenantId: user.tenantId,
        owner: { $ne: user._id },
        projectId,
        hideHistory: { $ne: true },
      },
      {
        fields: {
          date: 1,
          owner: 1,
          startMinute: 1,
          endMinute: 1,
          taskType: 1,
          taskDesc: 1,
          useTaskType: 1,
          lastModified: 1,
        },
        sort: { date: -1, lastModified: -1 },
        limit,
      },
    ).fetchAsync();

    // join owners
    const ownerIds = [...new Set(timesRes.map(time => time.owner))].sort();
    const ownersRes = await Meteor.users.find({ tenantId: user.tenantId, _id: { $in: ownerIds } }, { fields: { name: 1 } }).fetchAsync();
    const timesWithOwnersJoined = timesRes.map(time => {
      const x = time;
      const ownerDoc = ownersRes.find(owner => owner._id === time.owner);
      if (ownerDoc?.name) x.ownerName = ownerDoc.name;
      return x;
    });
    // /join owners

    return timesWithOwnersJoined;
  },
  async timeHistoryClientSelf(timeId, clientId, limit) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    check(timeId, String);
    check(clientId, String);
    check(limit, Number);

    if (limit > 200) {
      throw new Meteor.Error('100', 'Query limit exceeded');
    }

    const clientProjects = await Projects.find({
      tenantId: user.tenantId,
      clientId,
    }).fetchAsync();
    const allProjectIds = clientProjects.map(project => project._id);

    const timesRes = await Times.find(
      {
        tenantId: user.tenantId,
        owner: user._id,
        projectId: { $in: allProjectIds },
        hideHistory: { $ne: true },
        _id: { $ne: timeId },
      },
      {
        fields: {
          date: 1,
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
      },
    ).fetchAsync();

    // join projects
    const projectIds = [...new Set(timesRes.map(time => time.projectId))].sort();
    const projectsRes = await Projects.find({ tenantId: user.tenantId, _id: { $in: projectIds } }, { fields: { name: 1 } }).fetchAsync();
    const timesWithProjectsJoined = timesRes.map(time => {
      const x = time;
      const projectDoc = projectsRes.find(project => project._id === time.projectId);
      if (projectDoc?.name) x.projectName = projectDoc.name;
      return x;
    });
    // /join projects

    return timesWithProjectsJoined;
  },
  async timeHistoryClientOthers(clientId, limit) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    if (!user.permissions.historyOthers) {
      throw new Meteor.Error('100', 'No permission to view task history of other users');
    }

    check(clientId, String);
    check(limit, Number);

    if (limit > 200) {
      throw new Meteor.Error('100', 'Query limit exceeded');
    }

    const clientProjects = await Projects.find({
      tenantId: user.tenantId,
      clientId,
    }).fetchAsync();
    const allProjectIds = clientProjects.map(project => project._id);

    const timesRes = await Times.find(
      {
        tenantId: user.tenantId,
        owner: { $ne: user._id },
        projectId: { $in: allProjectIds },
        hideHistory: { $ne: true },
      },
      {
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
      },
    ).fetchAsync();

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
  async timeHistorySearch(taskDesc, owner, scope, projectId, clientId, sort, limit) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    check(taskDesc, String);
    check(owner, String);
    check(scope, String);
    check(projectId, Match.Maybe(String));
    check(clientId, Match.Maybe(String));
    check(sort, String);
    check(limit, Number);

    if (limit > 200) {
      throw new Meteor.Error('100', 'Query limit exceeded');
    }

    const escaped = taskDesc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const normalized = normalizeStringForAC(escaped);
    const searchQuery = new RegExp(normalized);

    const queryObj = {
      tenantId: user.tenantId,
      taskDescNormalized: searchQuery,
      hideHistory: { $ne: true },
    };

    // target owners
    if (owner === 'me') {
      queryObj.owner = user._id;
    } else if (owner === 'others') {
      if (!user.permissions.historyOthers) {
        throw new Meteor.Error('100', 'No permission to view task history of other users');
      }
      queryObj.owner = { $ne: user._id };
    } else if (!user.permissions.historyOthers) {
      throw new Meteor.Error('100', 'No permission to view task history of other users');
    }

    // target projects
    if (scope === 'selectedProject') {
      queryObj.projectId = projectId;
    } else if (scope === 'clientProjects') {
      check(clientId, String);
      const clientProjects = await Projects.find({
        tenantId: user.tenantId,
        clientId,
      }).fetchAsync();
      const projectIds = [];
      for (const clientProject of clientProjects) {
        projectIds.push(clientProject._id);
      }
      queryObj.projectId = { $in: projectIds };
    } else {
      queryObj.projectId = { $exists: true };
    }

    // sort
    const sortObj = sort === 'dte' ? { date: -1, lastModified: -1 } : { lastModified: -1, date: -1 };

    const timesRes = await Times.find(queryObj, {
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
      sort: sortObj,
      limit,
    }).fetchAsync();

    // join projects and owners
    const projectIds = [...new Set(timesRes.map(time => time.projectId))].sort();
    const projectsRes = await Projects.find({ tenantId: user.tenantId, _id: { $in: projectIds } }, { fields: { name: 1, clientId: 1 } }).fetchAsync();
    const ownerIds = [...new Set(timesRes.map(time => time.owner))].sort();
    const ownersRes = await Meteor.users.find({ tenantId: user.tenantId, _id: { $in: ownerIds } }, { fields: { name: 1 } }).fetchAsync();
    const timesWithProjectsAndOwnersJoined = timesRes.map(time => {
      const x = time;
      const projectDoc = projectsRes.find(project => project._id === time.projectId);
      if (projectDoc?.name) x.projectName = projectDoc.name;
      if (projectDoc?.clientId) x.clientId = projectDoc.clientId;
      const ownerDoc = ownersRes.find(ownr => ownr._id === time.owner);
      if (ownerDoc?.name) x.ownerName = ownerDoc.name;
      return x;
    });
    // /join projects and owners

    // join clients
    const clientIds = [...new Set(timesWithProjectsAndOwnersJoined.map(time => time.clientId))].sort();
    const clientsRes = await Clients.find({ tenantId: user.tenantId, _id: { $in: clientIds } }, { fields: { name: 1 } }).fetchAsync();
    const timesWithAllJoins = timesWithProjectsAndOwnersJoined.map(time => {
      const x = time;
      const clientDoc = clientsRes.find(client => client._id === time.clientId);
      if (clientDoc?.name) x.clientName = clientDoc.name;
      if (x.clientId) x.clientId = null;
      return x;
    });
    // /join clients

    return timesWithAllJoins;
  },
  async timeSetDate(timeId, selDate) {
    check(timeId, String);
    check(selDate, Date);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    if (selDate.getUTCHours() !== 0 || selDate.getUTCMinutes() !== 0 || selDate.getUTCSeconds() !== 0 || selDate.getUTCMilliseconds() !== 1) {
      throw new Meteor.Error('403', 'Incorrect date format');
    }

    const query = { _id: timeId, owner: user._id };
    if (Meteor.isServer) query.tenantId = user.tenantId;
    await Times.updateAsync(query, {
      $set: { date: selDate, lastModified: new Date() },
    });
  },
});
