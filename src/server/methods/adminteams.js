/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Tenants } from '/src/shared/collections/collections.js';

Meteor.methods({
  async loadTeams() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');

    const res = await Tenants.findOneAsync({ _id: user.tenantId }, { fields: { teams: 1 } });

    return res.teams;
  },
  async saveTeams(teams) {
    check(teams, Array);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');

    const tenant = await Tenants.findOneAsync(user.tenantId);
    let idCounter = Number.parseInt(tenant.teamsIdCounter, 10) || 10;
    const teamsProcessed = teams.map(team => {
      if (team.id) return { ...team };
      idCounter += 1;
      return { ...team, id: String(idCounter) };
    });
    await Tenants.updateAsync({ _id: user.tenantId }, { $set: { teams: teamsProcessed, teamsIdCounter: idCounter } });
    const res = await Meteor.callAsync('loadTeams');
    return res;
  },
});
