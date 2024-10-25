/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Tenants } from '/src/shared/collections/collections.js';
import inOutOptions from '/src/server/initdata/inout-options.js';

export default async email => {
  const teams = [
    { id: '10', name: 'Dispute' },
    { id: '20', name: 'Finance' },
    { id: '30', name: 'Employment' },
  ];

  const composerExportersFront = Meteor.settings.private.demoComposerExportersFront || [];
  const composerExportersBack = Meteor.settings.private.demoComposerExportersBack || [];

  const tenantId = await Tenants.insertAsync({
    name: 'Sample Law Firm',
    email: 'demo@tuumik.com',
    phone: '+12345678912345',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    weekStart: 'mon',
    thouMark: 'comma',
    decimalMark: 'period',
    currency: { str: 'EUR', sign: '€' },
    useTaskTypesByDefault: false,
    trackerStep: 1,
    inOutOptions,
    teams,
    homeView: 'charts',
    composerExportersFront,
    composerExportersBack,
    preventLogin: false,
    createdAt: new Date(),
  });
  return tenantId;
};
