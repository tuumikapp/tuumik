/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Clients, Projects, TaskGroups } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';
import { Random } from 'meteor/random';

export default async tenantId => {
  const docs = [];

  const getRandomProjectName = () => {
    const projectNames = [
      'Sale of Zentagrid Manufacturing Facilities',
      'Dispute with Alterion AB',
      'Public Procurement No 12845297 - Reconstruction of Ventgatan 175 Office Building',
      'Insolvency of Agerion LLC',
      'General counseling',
      'Public Procurement No 29454878 - Development of Software for Ministry of Financial Affairs',
      'Dispute with Arcturus GmbH (Civil Matter No 17-23547-734)',
      'Dispute with Financial Supervision Authority (Administrative Matter No 12-33984-247)',
      'Loan Agreements with Genningsen Bank',
      'Dispute with Data Protection Authority',
      'Cooperation Agreement with ABS Construction LLC',
      'Dispute with Alden Insurance LLC',
      'Zoning Permits for Axalia Center',
      'Project Fox',
      'Software Development Agreement (VPN Portal)',
      'Pledge Agreement with ZTF Invest AB',
      'Sales Agreement No 144-1228 (Maltikal Chemical Facilities)',
      'Dispute with Peter Wright',
      'Termination of Partnership with Chromitel AB',
      'Termination of Activities in Norway',
      'Merger with Zentalia OY',
      'Economic Activity Permits',
      'Share Purchase Agreement (Indixa AB)',
      'Dispute with Dynocel AB',
      'Lease Agreements (CRJ 700)',
      'Lease Agreements of Voonetel Plaza',
      'Termination of Lease Agreement (Atelia 17)',
      'Public Procurement No 28545218 - Expansion of Trolleby Bridge',
      'Share Purchase Agreement (Vetixen Engineering AB)',
      'Decommissioning of Gwentel Power Plant',
      'Sale of Duxley Manor',
      'Employment Agreement Templates',
      'Employment Dispute with James Smith',
      'Cooperation Agreement with Denix AB',
      'Customs and Import Restrictions in Sweden',
      'Dispute with ZTF Chemicals AB',
      'Enforcement of Court Decision in Civil Matter No 115-543478',
      'Termination of Lease Agreement No 12-42 (Idelor AB, Almena Center)',
      'Dispute with Ataxa GmbH',
      'Dispute with Zental AB',
    ];
    return projectNames[Math.floor(Math.random() * projectNames.length)];
  };

  const taskGroupId = await TaskGroups.findOneAsync({ tenantId })._id;
  const tenantClients = await Clients.find({ tenantId }).fetchAsync();
  for (const tenantClient of tenantClients) {
    const projectCount = Math.floor(Math.random() * 2 + 1);
    for (let i = 0; i < projectCount; i += 1) {
      const name = getRandomProjectName();
      const doc = {
        _id: Random.id(),
        tenantId,
        name,
        nameNormalized: normalizeStringForAC(name),
        clientId: tenantClient._id,
        taskGroupIds: taskGroupId ? [taskGroupId] : [],
        useTaskTypes: false,
        reminder: '',
        toEmail: 'info@example.com',
        created: new Date(),
        lastModified: new Date(),
      };
      docs.push(doc);
    }
  }
  await Projects.rawCollection().insertMany(docs);
};
