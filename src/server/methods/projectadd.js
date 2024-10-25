/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Projects, Clients, Tenants } from '/src/shared/collections/collections.js';
import projectAdd from '/src/server/integrations/project-add.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

Meteor.methods({
  async projectInsert(name, clientId) {
    check(name, String);
    check(clientId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.projectsEdit) throw new Meteor.Error('403', 'No permission to add projects');
    if (name.length < 2) throw new Meteor.Error('405', 'Project name must be at least 2 characters');
    if (!Clients.findOneAsync({ tenantId: user.tenantId, _id: clientId })) throw new Meteor.Error('404', 'No client found');

    const tenant = await Tenants.findOneAsync(user.tenantId);

    const doc = {
      tenantId: user.tenantId,
      name,
      nameNormalized: normalizeStringForAC(name),
      clientId,
      taskGroupIds: [],
      useTaskTypes: !!tenant.useTaskTypesByDefault,
      reminder: '',
      created: new Date(),
      lastModified: new Date(),
    };

    const x = await Projects.insertAsync(doc);
    projectAdd({ name, clientId });
    return x;
  },
  async projectHistory() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.projectsEdit) throw new Meteor.Error('403', 'No permission to add projects');

    const projectsRes = await Projects.find(
      { tenantId: user.tenantId },
      {
        fields: { name: 1, clientId: 1, created: 1 },
        sort: { created: -1 },
        limit: 10,
      },
    ).fetchAsync();

    // join clients
    const clientIds = [...new Set(projectsRes.map(project => project.clientId))].sort();
    const clientsRes = await Clients.find({ tenantId: user.tenantId, _id: { $in: clientIds } }, { fields: { name: 1 } }).fetchAsync();
    const projectsWithClientsJoined = projectsRes.map(project => {
      const x = project;
      const clientDoc = clientsRes.find(client => client._id === project.clientId);
      if (clientDoc?.name) x.clientName = clientDoc.name;
      return x;
    });

    return projectsWithClientsJoined;
  },
});
