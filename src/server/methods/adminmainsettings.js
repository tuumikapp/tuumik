/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Tenants } from '/src/shared/collections/collections.js';
import { isValidEmailAddress } from '/src/server/utils/validation';

Meteor.methods({
  async mainSettingsLoad() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access main settings');

    const res = await Tenants.findOneAsync(
      { _id: user.tenantId },
      {
        fields: {
          name: 1,
          email: 1,
          phone: 1,
          currency: 1,
          dateFormat: 1,
          timeFormat: 1,
          weekStart: 1,
          thouMark: 1,
          decimalMark: 1,
          useTaskTypesByDefault: 1,
          trackerStep: 1,
        },
      },
    );
    return res;
  },
  async mainSettingsSave(settings) {
    check(settings, Object);
    check(settings.name, String);
    check(settings.email, String);
    check(settings.phone, String);
    check(settings.currency, Object);
    check(settings.dateFormat, String);
    check(settings.timeFormat, String);
    check(settings.weekStart, String);
    check(settings.thouMark, String);
    check(settings.decimalMark, String);
    check(settings.useTaskTypesByDefault, Boolean);
    check(settings.trackerStep, Number);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access main settings');

    if (!isValidEmailAddress(settings.email)) throw new Meteor.Error('405', 'Unrecognized email format');

    if (settings.dateFormat !== 'DD.MM.YYYY' && settings.dateFormat !== 'MM.DD.YYYY' && settings.dateFormat !== 'YYYY.MM.DD') {
      throw new Meteor.Error('405', 'Unrecognised date format');
    }

    if (settings.timeFormat !== 'HH:mm' && settings.timeFormat !== 'h:mm A') throw new Meteor.Error('405', 'Unrecognised time format');
    if (settings.thouMark !== 'comma' && settings.thouMark !== 'space') throw new Meteor.Error('405', 'Unrecognised thousands separator');
    if (settings.decimalMark !== 'period' && settings.decimalMark !== 'comma') throw new Meteor.Error('405', 'Unrecognised decimal separator');
    if (settings.thouMark === settings.decimalMark) throw new Meteor.Error('405', 'Thousands and decimal separators must be different');

    if (settings.trackerStep !== 1 && settings.trackerStep !== 6 && settings.trackerStep !== 12 && settings.trackerStep !== 15 && settings.trackerStep !== 30) {
      throw new Meteor.Error('405', 'Unrecognised tracker step');
    }

    await Tenants.updateAsync(
      { _id: user.tenantId },
      {
        $set: {
          name: settings.name,
          email: settings.email,
          phone: settings.phone,
          currency: {
            str: settings.currency.str,
            sign: settings.currency.sign,
          },
          dateFormat: settings.dateFormat,
          timeFormat: settings.timeFormat,
          weekStart: settings.weekStart,
          thouMark: settings.thouMark,
          decimalMark: settings.decimalMark,
          useTaskTypesByDefault: settings.useTaskTypesByDefault,
          trackerStep: settings.trackerStep,
        },
      },
    );
  },
});
