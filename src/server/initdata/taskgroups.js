/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { TaskGroups } from '/src/shared/collections/collections.js';

export default async tenantId => {
  await TaskGroups.insertAsync({
    tenantId,
    name: 'English',
    position: 1,
    showByDefault: true,
    types: [
      { txt: 'review of document:' },
      { txt: 'legal analysis:' },
      { txt: 'preparation of document:' },
      { txt: 'preparation of agreement:' },
      { txt: 'preparation of amendments to agreement:' },
      { txt: 'preparation of memorandum:' },
      { txt: 'preparation of pleading:' },
      { txt: 'court hearing:' },
      { txt: 'preparation of email:' },
      { txt: 'telephone call:' },
      { txt: 'meeting:' },
    ],
  });
};
