/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Times, Projects } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';
import { Random } from 'meteor/random';

dayjs.extend(utc);

export default async tenantId => {
  const docs = [];

  const getRandomPleading = () => {
    const pleadings = ['complaint', 'counterclaim', 'cross-claim', 'demurrer', 'cross-complaint', 'third party complaint'];
    return pleadings[Math.floor(Math.random() * pleadings.length)];
  };

  const getRandomHearing = () => {
    const pleadings = ['court of first instance', 'district court'];
    return pleadings[Math.floor(Math.random() * pleadings.length)];
  };

  const getRandomAgreement = () => {
    const agreements = [
      'Loan Agreement',
      'Share Purchase Agreement',
      'Sales Agreement',
      'Lease Agreement',
      'Non-Disclosure Agreement',
      'Term Sheet',
      'Letter of Intent',
      'License Agreement',
      'Founders Agreement',
      'Employment Agreement',
      'Option Agreement',
      'Shareholders Agreement',
      'Settlement Agreement',
    ];
    return agreements[Math.floor(Math.random() * agreements.length)];
  };

  const getRandomAnalysisTopic = () => {
    const topics = [
      'tax residency in EU',
      'set-off of claims',
      'penalties for unlawful disclosure of confidential data',
      'prerequisites for exportation of restricted goods',
      'compensation of procedural expenses',
      'possibilities to demand evidence from third parties',
      'termination of joint ownership',
      'limitations on establishment of SPVs',
      'terms for filing claims in insolvency proceedings',
      'limitations of expert opinions in civil process',
      'data protection requirements',
      'zoning requirements pertaining to wind generators',
    ];
    return topics[Math.floor(Math.random() * topics.length)];
  };

  const getRandomEmailPhoneTopic = () => {
    const topics = [
      'state fee',
      'settlement negotiations',
      'outstanding invoices',
      'payment details',
      'additional documents',
      'additional claims',
      'closing details',
      'third party contacts',
      'meeting',
      'compensation of procedural expenses',
      'press release',
      'review of statements',
    ];
    return topics[Math.floor(Math.random() * topics.length)];
  };

  const getRandomPersons = () => {
    const persons = [
      'S. Barnes',
      'P. Eastgate',
      'F. Williams',
      'L. Jones',
      'E. Murphy',
      'S. Wilson',
      'T. Smith',
      'C. Anderson',
      'A. Davies',
      'J. Brown and A. Morton',
      'S. Roberts and R. Garcia',
      'O. Walsh and J. Lee',
    ];
    return persons[Math.floor(Math.random() * persons.length)];
  };

  const getRandomInternalComment = () => {
    const comments = [
      'This might constitute a violation of client agreement terms',
      'Perhaps we should not disclose performing this task?',
      'Should this be modified into something more general?',
      'NB! A potential risk with regard to other proceedings!',
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  };

  const getRandomTaskDesc = () => {
    const tasksDescs = [
      `drafting of ${getRandomPleading()}`,
      `court hearing, ${getRandomHearing()}`,
      `drafting of ${getRandomAgreement()}`,
      `drafting of amendments to ${getRandomAgreement()}`,
      `legal analysis re ${getRandomAnalysisTopic()}`,
      `review of ${getRandomAgreement()}`,
      `drafting of memorandum re ${getRandomAnalysisTopic()}`,
      `drafting of email to ${getRandomPersons()} re ${getRandomEmailPhoneTopic()}`,
      `telephone call with ${getRandomPersons()} re ${getRandomEmailPhoneTopic()}`,
      `meeting with ${getRandomPersons()}`,
    ];
    return tasksDescs[Math.floor(Math.random() * tasksDescs.length)];
  };

  const tenantProjects = await Projects.find({ tenantId }).fetchAsync();
  const getRandomProject = () => {
    return tenantProjects[Math.floor(Math.random() * tenantProjects.length)];
  };

  const targetDates = [
    dayjs
      .utc()
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(1)
      .toDate(),
    dayjs
      .utc()
      .add(1, 'days')
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(1)
      .toDate(),
    dayjs
      .utc()
      .subtract(1, 'days')
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(1)
      .toDate(),
    dayjs
      .utc()
      .subtract(2, 'days')
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(1)
      .toDate(),
    dayjs
      .utc()
      .subtract(3, 'days')
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(1)
      .toDate(),
    dayjs
      .utc()
      .subtract(4, 'days')
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(1)
      .toDate(),
    dayjs
      .utc()
      .subtract(6, 'days')
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(1)
      .toDate(),
    dayjs
      .utc()
      .subtract(9, 'days')
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(1)
      .toDate(),
    dayjs
      .utc()
      .subtract(14, 'days')
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(1)
      .toDate(),
    dayjs
      .utc()
      .subtract(19, 'days')
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(1)
      .toDate(),
  ];

  const tenantUsers = await Meteor.users.find({ tenantId }).fetchAsync();
  for (const tenantUser of tenantUsers) {
    for (const targetDate of targetDates) {
      let endMinute = Math.floor(Math.random() * 120 + 400);
      const timesCount = Math.floor(Math.random() * 6 + 3);
      for (let i = 0; i < timesCount; i += 1) {
        const dateDelayMinutes = Math.floor(Math.random() * 1400 + 1);
        const dateCreatedModified = dayjs
          .utc(targetDate)
          .add(dateDelayMinutes, 'minutes')
          .toDate();
        const taskDesc = getRandomTaskDesc();
        const startMinute = endMinute + Math.floor(Math.random() * 40 + 1);
        endMinute = startMinute + Math.floor(Math.random() * 120 + 6);
        const doc = {
          _id: Random.id(),
          tenantId,
          date: targetDate,
          owner: tenantUser._id,
          startMinute,
          endMinute,
          projectId: getRandomProject()._id,
          taskDesc,
          taskDescNormalized: normalizeStringForAC(taskDesc),
          intCom: Math.random() < 0.05 ? getRandomInternalComment() : '',
          tagColor: '',
          tagText: '',
          created: dateCreatedModified,
          lastModified: dateCreatedModified,
        };
        if (endMinute < 1440) docs.push(doc);
      }
    }
  }
  await Times.rawCollection().insertMany(docs);
};
