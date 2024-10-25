/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Accounts } from 'meteor/accounts-base';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

export default async tenantId => {
  const persons = [
    {
      name: 'John Smith',
      pic: 'https://assets.tuumik.com/users/v1/user1-large.jpg',
    },
    {
      name: 'Elizabeth Jones',
      pic: 'https://assets.tuumik.com/users/v1/user2-large.jpg',
    },
    {
      name: 'Chris Moore',
      pic: 'https://assets.tuumik.com/users/v1/user3-large.jpg',
    },
    {
      name: 'Jessica Miller',
      pic: 'https://assets.tuumik.com/users/v1/user4-large.jpg',
    },
    {
      name: 'Frank Davis',
      pic: 'https://assets.tuumik.com/users/v1/user5-large.jpg',
    },
    {
      name: 'Peter Wilson',
      pic: 'https://assets.tuumik.com/users/v1/user6-large.jpg',
    },
    {
      name: 'Samantha Anderson',
      pic: 'https://assets.tuumik.com/users/v1/user7-large.jpg',
    },
    {
      name: 'Richard Jones',
      pic: 'https://assets.tuumik.com/users/v1/user8-large.jpg',
    },
    {
      name: 'George Harris',
      pic: 'https://assets.tuumik.com/users/v1/user9-large.jpg',
    },
    {
      name: 'Robin Hawkins',
      pic: 'https://assets.tuumik.com/users/v1/user10-large.jpg',
    },
    {
      name: 'Brooke Norman',
      pic: 'https://assets.tuumik.com/users/v1/user11-large.jpg',
    },
    {
      name: 'Peter Freeman',
      pic: 'https://assets.tuumik.com/users/v1/user12-large.jpg',
    },
    {
      name: 'Gary Carroll',
      pic: 'https://assets.tuumik.com/users/v1/user13-large.jpg',
    },
    {
      name: 'Chloe Robinson',
      pic: 'https://assets.tuumik.com/users/v1/user14-large.jpg',
    },
    {
      name: 'Spencer Howell',
      pic: 'https://assets.tuumik.com/users/v1/user15-large.jpg',
    },
    {
      name: 'Amanda Green',
      pic: 'https://assets.tuumik.com/users/v1/user16-large.jpg',
    },
  ];

  for (const person of persons) {
    const permissions = {
      timeTracker: true,
      historyOthers: true,
      catalog: true,
      monitor: true,
      clientsEdit: true,
      projectsEdit: true,
      composer: true,
      inOutSelf: true,
      inOutView: true,
      inOutEditOthers: true,
      admin: true,
    };

    const randomTeamId = Math.random() < 0.5 ? '20' : '30';

    const profile = {
      tenantId,
      name: person.name,
      nameNormalized: normalizeStringForAC(person.name),
      permissions,
      inOutStatus: '6',
      inTeams: ['10', randomTeamId],
      pic: person.pic,
      enabled: true,
    };

    let email;
    do {
      email = `user${Math.floor(Math.random() * 100000 + 100000)}@example.com`;
    } while (await Accounts.findUserByEmail(email));
    const password = 'demo';
    await Accounts.createUserAsync({ email, password, profile });
  }
};
