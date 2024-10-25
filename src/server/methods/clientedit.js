/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Clients, Projects } from '/src/shared/collections/collections.js';
import clientEdit from '/src/server/integrations/client-edit.js';
import clientDelete from '/src/server/integrations/client-delete.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

Meteor.methods({
  async getClientForEdit(clientId) {
    check(clientId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.clientsEdit) throw new Meteor.Error('403', 'No permission to access client data');

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
          createdBy: 1,
          lastModified: 1,
        },
      },
    );

    if (!clientRes) throw new Meteor.Error('404', 'Specified client not found');
    return { client: clientRes };
  },
  async clientSave(client) {
    check(client, Object);
    check(client.name, String);
    check(client.reminder, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.clientsEdit) throw new Meteor.Error('403', 'No permission to modify client data');

    if (client.name.length < 2) throw new Meteor.Error('405', 'Client name must be at least 2 characters');

    const clientId = client._id;
    const setObj = {};
    setObj.name = client.name;
    setObj.nameNormalized = normalizeStringForAC(client.name);
    setObj.reminder = client.reminder;
    setObj.tel = client.tel;
    setObj.email = client.email;
    setObj.address = client.address;
    setObj.lastModified = new Date();

    await Clients.updateAsync({ tenantId: user.tenantId, _id: clientId }, { $set: setObj });
    clientEdit({ client });
  },
  async clientDelete(clientId) {
    check(clientId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.clientsEdit) throw new Meteor.Error('403', 'No permission to access client data');

    const project = await Projects.findOneAsync({ tenantId: user.tenantId, clientId });
    if (project) throw new Meteor.Error('405', 'Cannot delete client since it has projects');

    await Meteor.users.updateAsync({ defaultClientId: clientId }, { $set: { defaultClientId: '' } });
    await Clients.removeAsync({ tenantId: user.tenantId, _id: clientId });
    clientDelete({ clientId });
  },
});
