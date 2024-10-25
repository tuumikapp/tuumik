/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Times } from '/src/shared/collections/collections.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

Meteor.methods({
  async loadHomeChartTotals(targetDate) {
    check(targetDate, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');

    const user = await Meteor.users.findOneAsync(this.userId);

    const startDate = dayjs
      .utc(targetDate)
      .startOf('month')
      .toDate();
    const endDate = dayjs
      .utc(targetDate)
      .endOf('month')
      .toDate();

    const pipeline = [
      {
        $match: {
          tenantId: user.tenantId,
          owner: this.userId,
          date: { $gt: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: '$date',
          totalMinutes: { $sum: { $subtract: ['$endMinute', '$startMinute'] } },
        },
      },
      { $sort: { date: 1 } },
    ];
    const seriesSource = await Times.rawCollection()
      .aggregate(pipeline)
      .toArray();

    // output series
    const seriesOut = [];
    let counterDate = dayjs
      .utc(startDate)
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(1);
    do {
      const dt = new Date(counterDate);
      const hit = seriesSource.find(doc => dayjs.utc(dt).isSame(doc._id));
      const minutes = hit ? hit.totalMinutes : 0;
      seriesOut.push(minutes);
      counterDate = dayjs.utc(counterDate).add(1, 'days');
    } while (counterDate < endDate);
    // /output series

    return { points: seriesOut, startDate };
  },
});
