/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Clients, Projects } from '/src/shared/collections/collections.js';

Meteor.methods({
  async pickClientInProjectPicker(clientId) {
    check(clientId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.catalog) throw new Meteor.Error('403', 'No permission to access project data');

    const clientRes = await Clients.findOneAsync({ tenantId: user.tenantId, _id: clientId }, { fields: { name: 1 } });
    const projectsRes = await Projects.find({ tenantId: user.tenantId, clientId }, { fields: { name: 1, created: 1, open: 1 } }).fetchAsync();

    return { client: clientRes, projects: projectsRes };
  },
  async pickProjectInProjectPicker(projectId) {
    check(projectId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.catalog) throw new Meteor.Error('403', 'No permission to access project data');

    const projectRes = await Projects.findOneAsync({ tenantId: user.tenantId, _id: projectId }, { fields: { name: 1, clientId: 1, created: 1, open: 1 } });
    const clientRes = await Clients.findOneAsync({ tenantId: user.tenantId, _id: projectRes.clientId }, { fields: { name: 1 } });

    return { client: clientRes, project: projectRes };
  },
});
