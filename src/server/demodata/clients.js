/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Clients } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';
import { Random } from 'meteor/random';

export default async tenantId => {
  const docs = [];

  const clientNames = [
    'Telior AS',
    'Nautica AS',
    'Arktik Invest AS',
    'Broadwell LLC',
    'Conterion Solar GmbH',
    'Swedish Timber AB',
    'Aeon Communication Inc',
    'Municipality of Greenwich',
    'Horizon Machinery GmbH',
    'Idena Architecture PLC',
    'Quantic Inc',
    'Morrison Engineering LLC',
    'Norton Systems AB',
    'Telavia Aeronautical Engineering AB',
    'Wilkinson Maynes LLP',
    /*
    'Finbank AB',
    'Vircom AG',
    'Gilleon Services PLC',
    'SMB Construction LLC',
    'Keitoberg LTD',
    'Finelia OY',
    'Fractal Telecommunication LLC',
    'Abertel GmbH',
    'Wells Acetel AB',
    'Weston AB',
    'Atelion Inc',
    'Atelmar Finance LLC',
    'Charlton Milling AB',
    'Sapetel Studios AB',
    'Davedon Retail AB',
    'AMS Hotels AB',
    'VXN Telemedia OY',
    'Martel GmbH',
    'Arpetel Logistics AS',
    'Valtratel AS',
    'Rekitel GmbH',
    'PMC Electronics LLC',
    'Altel Manufacturing and Retail AB',
    'Xenimex Entertainment Inc',
    'Indelex Systems AB',
    */
  ];

  for (const clientName of clientNames) {
    const doc = {
      _id: Random.id(),
      tenantId,
      name: clientName,
      nameNormalized: normalizeStringForAC(clientName),
      reminder: '',
      created: new Date(),
      lastModified: new Date(),
    };
    docs.push(doc);
  }
  await Clients.rawCollection().insertMany(docs);
};
