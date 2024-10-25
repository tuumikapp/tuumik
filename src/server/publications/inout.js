/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

Meteor.publish('inOutUsers', async function(searchedUserId, teamId) {
  check(searchedUserId, String);
  check(teamId, String);

  if (!this.userId) {
    return this.ready();
  }

  const user = await Meteor.users.findOneAsync(this.userId);

  if (!user.permissions.inOutView) {
    return this.ready();
  }

  const queryForSearch = {
    tenantId: user.tenantId,
    _id: searchedUserId,
    inOutShow: true,
    disabled: { $ne: true },
  };

  const queryForTeams = {
    tenantId: user.tenantId,
    inTeams: teamId,
    inOutShow: true,
    disabled: { $ne: true },
  };

  const query = searchedUserId ? queryForSearch : queryForTeams;

  return Meteor.users.find(query, {
    fields: {
      name: 1,
      pic: 1,
      inOutShow: 1,
      inOutStatus: 1,
      inOutETA: 1,
      inOutNote: 1,
      inOutUpdateById: 1,
      inOutUpdateByName: 1,
      inOutUpdateAt: 1,
      inTeams: 1,
    },
  });
});
