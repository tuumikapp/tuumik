/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Statuses } from '/src/shared/collections/collections.js';
import { Random } from 'meteor/random';

dayjs.extend(utc);

export default async tenantId => {
  const docs = [];

  const getEveningStatus = () => {
    const status = '6';
    const addMinutes = Math.floor(Math.random() * 600 + 10);
    return { status, addMinutes };
  };

  const getBusinessHoursStatus = () => {
    let status = String(Math.floor(Math.random() * 6 + 1));
    const prevStatus = docs.length ? docs[docs.length - 1].status : '';
    while (status === prevStatus) {
      status = String(Math.floor(Math.random() * 6 + 1));
    }
    const addMinutes = Math.floor(Math.random() * 180 + 10);
    return { status, addMinutes };
  };

  const setUserStatus = async (tenantUser, updateDate) => {
    let status = String(Math.floor(Math.random() * 6 + 1));
    const prevStatus = docs.length ? docs[docs.length - 1].status : '';
    while (status === prevStatus) {
      status = String(Math.floor(Math.random() * 6 + 1));
    }
    await Meteor.users.updateAsync(
      { _id: tenantUser._id },
      {
        $set: {
          inOutStatus: status,
          inOutUpdateById: tenantUser._id,
          inOutUpdateByName: tenantUser.name,
          inOutUpdateAt: updateDate,
        },
      },
    );
  };

  const startDate = dayjs
    .utc()
    .subtract(7, 'days')
    .toDate();
  const nowDate = new Date();
  const tenantUsers = await Meteor.users.find({ tenantId }).fetchAsync();
  for (const tenantUser of tenantUsers) {
    let counterDate = dayjs.utc(startDate).toDate();
    while (counterDate < nowDate) {
      const start = dayjs.utc(counterDate).toDate();
      const hour = start.getHours();
      let x;
      if (hour > 17) {
        x = getEveningStatus();
      } else {
        x = getBusinessHoursStatus();
      }
      counterDate = dayjs.utc(counterDate).add(x.addMinutes, 'minutes').toDate();
      const doc = {
        _id: Random.id(),
        tenantId,
        userId: tenantUser._id,
        status: x.status,
        start,
        end: counterDate,
      };
      if (doc.end < nowDate) {
        docs.push(doc);
      } else {
        const updateDate = docs.length ? docs[docs.length - 1].end : nowDate;
        await setUserStatus(tenantUser, updateDate);
      }
    }
  }
  await Statuses.rawCollection().insertMany(docs);
};
