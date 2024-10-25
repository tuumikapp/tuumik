/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Tenants, Statuses } from '/src/shared/collections/collections.js';

Meteor.methods({
  async setInOutStatusSelf(status) {
    check(status, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.inOutSelf) throw new Meteor.Error('403', 'No permission to edit in/out');

    const tenant = await Tenants.findOneAsync(user.tenantId);
    const { inOutOptions } = tenant;

    if (!inOutOptions.find(inOutOption => inOutOption.id === status)) throw new Meteor.Error('400', 'Unrecognized in/out status');

    const dateNow = new Date();

    await Meteor.users.updateAsync(
      { _id: this.userId },
      {
        $set: {
          inOutStatus: status,
          inOutUpdateById: this.userId,
          inOutUpdateByName: user.name,
          inOutUpdateAt: dateNow,
        },
      },
    );

    await Statuses.insertAsync({
      tenantId: user.tenantId,
      userId: this.userId,
      status: user.inOutStatus,
      start: user.inOutUpdateAt,
      end: dateNow,
    });
  },
  async setInOutStatusOthers(targetUserId, status) {
    check(status, String);
    check(targetUserId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (user._id !== targetUserId && !user.permissions.inOutEditOthers) throw new Meteor.Error('403', 'No permission to edit in/out');

    const targetUser = await Meteor.users.findOneAsync(targetUserId);
    if (!targetUser) throw new Meteor.Error('404', 'Target user not found');

    const tenant = await Tenants.findOneAsync(user.tenantId);
    const { inOutOptions } = tenant;

    if (!inOutOptions.find(inOutOption => inOutOption.id === status)) throw new Meteor.Error('400', 'Unrecognized in/out status');

    const dateNow = new Date();

    await Meteor.users.updateAsync(
      { tenantId: user.tenantId, _id: targetUserId },
      {
        $set: {
          inOutStatus: status,
          inOutUpdateById: user._id,
          inOutUpdateByName: user.name,
          inOutUpdateAt: dateNow,
        },
      },
    );

    await Statuses.insertAsync({
      tenantId: user.tenantId,
      userId: targetUser._id,
      status: targetUser.inOutStatus,
      start: targetUser.inOutUpdateAt,
      end: dateNow,
    });
  },
  async setInOutNoteSelf(note) {
    check(note, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.inOutSelf) throw new Meteor.Error('403', 'No permission to edit in/out');

    await Meteor.users.updateAsync(
      { _id: this.userId },
      {
        $set: {
          inOutNote: note,
          inOutUpdateById: this.userId,
          inOutUpdateByName: user.name,
          inOutUpdateAt: new Date(),
        },
      },
    );
  },
  async setInOutNoteOthers(targetUserId, note) {
    check(note, String);
    check(targetUserId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (user._id !== targetUserId && !user.permissions.inOutEditOthers) throw new Meteor.Error('403', 'No permission to edit in/out');

    await Meteor.users.updateAsync(
      { tenantId: user.tenantId, _id: targetUserId },
      {
        $set: {
          inOutNote: note,
          inOutUpdateById: user._id,
          inOutUpdateByName: user.name,
          inOutUpdateAt: new Date(),
        },
      },
    );
  },
  async setInOutETASelf(note) {
    check(note, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.inOutSelf) throw new Meteor.Error('403', 'No permission to edit in/out');

    await Meteor.users.updateAsync(
      { _id: this.userId },
      {
        $set: {
          inOutETA: note,
          inOutUpdateById: this.userId,
          inOutUpdateByName: user.name,
          inOutUpdateAt: new Date(),
        },
      },
    );
  },
  async setInOutETAOthers(targetUserId, note) {
    check(note, String);
    check(targetUserId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (user._id !== targetUserId && !user.permissions.inOutEditOthers) throw new Meteor.Error('403', 'No permission to edit in/out');

    await Meteor.users.updateAsync(
      { tenantId: user.tenantId, _id: targetUserId },
      {
        $set: {
          inOutETA: note,
          inOutUpdateById: user._id,
          inOutUpdateByName: user.name,
          inOutUpdateAt: new Date(),
        },
      },
    );
  },
});
