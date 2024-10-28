/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Tenants } from '/src/shared/collections/collections.js';

Meteor.methods({
  async loadExporters() {
    if (Meteor.settings.public.demoMode) throw new Meteor.Error('403', 'Not allowed in demo environment');
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');

    const res = await Tenants.findOneAsync({ _id: user.tenantId }, { fields: { composerExportersBack: 1 } });

    return res.composerExportersBack;
  },
  async saveExporters(exporters) {
    check(exporters, Array);

    if (Meteor.settings.public.demoMode) throw new Meteor.Error('403', 'Not allowed in demo environment');
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');

    const tenant = await Tenants.findOneAsync(user.tenantId);
    let idCounter = Number.parseInt(tenant.exportersIdCounter, 10) || 10;
    const exportersProcessed = exporters.map(exporter => {
      if (exporter.id) return { ...exporter };
      idCounter += 1;
      return { ...exporter, id: String(idCounter) };
    });
    const composerExportersFront = exportersProcessed.map(x => {
      return { id: x.id, name: x.name };
    });
    await Tenants.updateAsync({ _id: user.tenantId }, { $set: { composerExportersBack: exportersProcessed, composerExportersFront, exportersIdCounter: idCounter } });
    const res = await Meteor.callAsync('loadExporters');
    return res;
  },
});
