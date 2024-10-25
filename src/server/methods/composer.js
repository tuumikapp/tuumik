/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Times, Clients, Projects, Tenants } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';
import { fetch } from 'meteor/fetch';

Meteor.methods({
  async composerAll(searchTerms) {
    check(searchTerms, Object);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.composer) throw new Meteor.Error('403', 'No permission to access composer');

    const tenant = await Tenants.findOneAsync(user.tenantId);
    const { currency, composerExportersFront } = tenant;

    const query = { tenantId: user.tenantId };
    const meta = {};

    if (searchTerms.projectPickers.length) {
      const projectIds = [];
      for (const x of searchTerms.projectPickers) {
        if (x.projectId) {
          projectIds.push(x.projectId);
        } else if (x.clientId) {
          const projects = await Projects.find({
            tenantId: user.tenantId,
            clientId: x.clientId,
          }).fetchAsync();
          for (const p of projects) projectIds.push(p._id);
        }
      }
      const projectIdsUnique = [...new Set(projectIds)];
      query.projectId = { $in: projectIdsUnique };

      const metaProjects = await Projects.find(
        {
          tenantId: user.tenantId,
          _id: { $in: projectIdsUnique },
        },
        { fields: { name: 1, clientId: 1 }, sort: { name: 1 } },
      ).fetchAsync();
      const clientIds = [];
      for (const p of metaProjects) clientIds.push(p.clientId);
      const clientIdsUnique = [...new Set(clientIds)];
      const metaClients = await Clients.find(
        {
          tenantId: user.tenantId,
          _id: { $in: clientIdsUnique },
        },
        { fields: { name: 1 }, sort: { name: 1 } },
      ).fetchAsync();
      const metaClientsWithProjects = metaClients.map(client => {
        const x = { name: client.name, projects: [] };
        for (const p of metaProjects) {
          if (p.clientId === client._id) x.projects.push({ name: p.name });
        }
        return x;
      });
      meta.clients = metaClientsWithProjects;
    }

    if (searchTerms.searchUsers.length) {
      const userIds = searchTerms.searchUsers;
      const userIdsUnique = [...new Set(userIds)];
      query.owner = { $in: userIdsUnique };
      meta.users = await Meteor.users.find({ tenantId: user.tenantId, _id: { $in: userIdsUnique } }, { fields: { name: 1 }, sort: { name: 1 } }).fetchAsync();
    }

    if (searchTerms.period.start || searchTerms.period.end) {
      const startDate = searchTerms.period.start;
      const endDate = searchTerms.period.end;
      const dateQuery = {};
      if (startDate) dateQuery.$gt = startDate;
      if (endDate) dateQuery.$lt = endDate;
      query.date = dateQuery;
      meta.period = searchTerms.period;
    }

    if (searchTerms.taskDesc) {
      const str = searchTerms.taskDesc;
      const escaped = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const normalized = normalizeStringForAC(escaped);
      const searchQuery = new RegExp(normalized);
      query.taskDescNormalized = searchQuery;
      meta.taskDesc = searchTerms.taskDesc;
    }

    const tc = searchTerms.tagColor;
    if (tc.green || tc.yellow || tc.red || tc.grey || tc.clear) {
      const colors = [];
      if (tc.green) colors.push('green');
      if (tc.yellow) colors.push('yellow');
      if (tc.red) colors.push('red');
      if (tc.grey) colors.push('grey');
      if (tc.clear) colors.push('');
      query.tagColor = { $in: colors };
      meta.tagColor = searchTerms.tagColor;
    }

    if (searchTerms.tagText) {
      query.tagText = searchTerms.tagText;
      meta.tagText = searchTerms.tagText;
    }

    const sort = {};
    if (searchTerms.sort.first !== 'none') {
      if (searchTerms.sort.first === 'date') sort.date = 1;
      if (searchTerms.sort.first === 'project') sort.projectId = 1;
      if (searchTerms.sort.first === 'user') sort.owner = 1;
      if (searchTerms.sort.first === 'task') sort.taskDesc = 1;
      if (searchTerms.sort.first === 'tag-color') sort.tagColor = 1;
      if (searchTerms.sort.first === 'tag-text') sort.tagText = 1;
    }
    if (searchTerms.sort.second !== 'none') {
      if (searchTerms.sort.second === 'date') sort.date = 1;
      if (searchTerms.sort.second === 'project') sort.projectId = 1;
      if (searchTerms.sort.second === 'user') sort.owner = 1;
      if (searchTerms.sort.second === 'task') sort.taskDesc = 1;
      if (searchTerms.sort.second === 'tag-color') sort.tagColor = 1;
      if (searchTerms.sort.second === 'tag-text') sort.tagText = 1;
    }
    if (searchTerms.sort.third !== 'none') {
      if (searchTerms.sort.third === 'date') sort.date = 1;
      if (searchTerms.sort.third === 'project') sort.projectId = 1;
      if (searchTerms.sort.third === 'user') sort.owner = 1;
      if (searchTerms.sort.third === 'task') sort.taskDesc = 1;
      if (searchTerms.sort.third === 'tag-color') sort.tagColor = 1;
      if (searchTerms.sort.third === 'tag-text') sort.tagText = 1;
    }
    if (!Object.keys(sort).length) sort.date = 1;
    meta.sort = searchTerms.sort;

    const timesRes = await Times.find(query, {
      fields: {
        date: 1,
        owner: 1,
        startMinute: 1,
        endMinute: 1,
        clientId: 1,
        projectId: 1,
        taskType: 1,
        taskDesc: 1,
        useTaskType: 1,
        hideHistory: 1,
        intCom: 1,
        tagColor: 1,
        tagText: 1,
      },
      sort,
      limit: Meteor.settings.public.composerLimit || 1000,
    }).fetchAsync();

    // join owners for times
    const ownerIds1 = [...new Set(timesRes.map(time => time.owner))].sort();
    const ownersRes1 = await Meteor.users.find({ tenantId: user.tenantId, _id: { $in: ownerIds1 } }, { fields: { name: 1 } }).fetchAsync();
    const timesWithOwnersJoined = timesRes.map(time => {
      const x = time;
      const ownerDoc = ownersRes1.find(owner => owner._id === time.owner);
      if (ownerDoc?.name) {
        x.ownerName = ownerDoc.name;
      }
      return x;
    });
    // /join owners for times

    // join projects for times
    const projectIds1 = [...new Set(timesWithOwnersJoined.map(time => time.projectId))].sort();
    const projectsRes1 = await Projects.find({ tenantId: user.tenantId, _id: { $in: projectIds1 } }, { fields: { name: 1, clientId: 1 } }).fetchAsync();
    const timesWithProjectsJoined = timesRes.map(time => {
      const x = time;
      const projectDoc = projectsRes1.find(project => project._id === time.projectId);
      if (projectDoc?.name) {
        x.projectName = projectDoc.name;
      }
      if (projectDoc?.clientId) {
        x.clientId = projectDoc.clientId;
      }
      return x;
    });
    // /join projects for times

    // join clients for times
    const clientIds1 = [...new Set(timesWithProjectsJoined.map(time => time.clientId))].sort();
    const clientsRes1 = await Clients.find({ tenantId: user.tenantId, _id: { $in: clientIds1 } }, { fields: { name: 1 } }).fetchAsync();
    const timesWithClientsJoined = timesRes.map(time => {
      const x = time;
      const clientDoc = clientsRes1.find(client => client._id === time.clientId);
      if (clientDoc?.name) {
        x.clientName = clientDoc.name;
      }
      if (x.clientId) x.clientId = undefined;
      return x;
    });
    // /join clients for times

    return {
      times: timesWithClientsJoined,
      meta,
      currency,
      composerExportersFront,
    };
  },
  async composerTagColor(selTimes, color) {
    check(selTimes, Array);
    check(color, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.composer) throw new Meteor.Error('403', 'No permission to access composer');

    await Times.updateAsync({ tenantId: user.tenantId, _id: { $in: selTimes } }, { $set: { tagColor: color, lastModified: new Date() } }, { multi: true });
  },
  async composerTagText(selTimes, text) {
    check(selTimes, Array);
    check(text, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.composer) throw new Meteor.Error('403', 'No permission to access composer');

    await Times.updateAsync({ tenantId: user.tenantId, _id: { $in: selTimes } }, { $set: { tagText: text, lastModified: new Date() } }, { multi: true });
  },
  async composerExporter(args) {
    check(args, Object);
    check(args.exporterId, String);
    check(args.exportOptions, Object);
    check(args.times, Array);
    check(args.meta, Object);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.composer) throw new Meteor.Error('403', 'No permission to access composer');

    const tenant = await Tenants.findOneAsync(user.tenantId);
    const { composerExportersBack } = tenant;
    const exporter = composerExportersBack.find(x => x.id === args.exporterId);

    if (!exporter) throw new Meteor.Error('403', 'No exporter function found');

    // convert dates to timestamps
    const times2 = args.times.map(time => {
      const timestamp = time.date.getTime();
      const timeObj = time;
      timeObj.date = timestamp;
      return timeObj;
    });

    const meta2 = args.meta;
    meta2.period.start = meta2.period.start.getTime();
    meta2.period.end = meta2.period.end.getTime();
    // /convert dates to timestamps

    const body = {
      exportOptions: args.exportOptions,
      times: times2,
      meta: meta2,
      user: {
        name: user.name,
      },
      tenant: {
        name: tenant.name,
        dateFormat: tenant.dateFormat,
        timeFormat: tenant.timeFormat,
        thouMark: tenant.thouMark,
        decimalMark: tenant.decimalMark,
        currency: tenant.currency,
      },
    };
    const opts = {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', 'x-api-key': exporter.apiKey },
    };
    try {
      const res = await fetch(exporter.url, opts);
      // client side (4xx) errors are not rejected in fetch, so checking for response status separately inside the try block here
      if (res.status === 403) throw new Meteor.Error('403', 'Invalid API key used for export');
      if (!res.ok) throw new Meteor.Error('500', 'Unable to export data');
      const data = await res.json();
      return data;
    } catch (err) {
      if (err.error === '403') throw new Meteor.Error('403', 'Invalid API key used for export');
      throw new Meteor.Error('500', 'Unable to export data');
    }
  },
});
