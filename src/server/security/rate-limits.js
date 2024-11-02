/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { Accounts } from 'meteor/accounts-base';

export default function() {
  Accounts.removeDefaultRateLimit();

  DDPRateLimiter.addRule(
    {
      type: 'method',
      name(name) {
        return ['insertTenantAndUser'].includes(name);
      },
      connectionId() {
        return true;
      },
    },
    10,
    3600000,
  );

  DDPRateLimiter.addRule(
    {
      type: 'method',
      name(name) {
        return ['login', 'createUser', 'resetPassword', 'forgotPassword'].includes(name);
      },
      connectionId() {
        return true;
      },
    },
    5,
    10000,
  );

  DDPRateLimiter.addRule(
    {
      type: 'method',
      name(name) {
        return [
          'timeInsert',
          'timeInsertCopy',
          'timeRemove',
          'timeResizeTop',
          'timeResizeBottom',
          'timeMove',
          'expenseInsert',
          'expenseInsertCopy',
          'expenseRemove',
          'expenseClientId',
          'expenseProjectId',
          'expenseClearClient',
          'expenseClearProject',
          'expenseDesc',
          'expensePrice',
          'expenseQuantity',
          'expenseIntCom',
          'expenseHideHistory',
          'expenseFillData',
        ].includes(name);
      },
      connectionId() {
        return true;
      },
    },
    20,
    4000,
  );

  DDPRateLimiter.addRule(
    {
      type: 'method',
      name(name) {
        return ['autocompleteClients', 'autocompleteProjects', 'autocompleteUsers'].includes(name);
      },
      connectionId() {
        return true;
      },
    },
    20,
    4000,
  );

  DDPRateLimiter.addRule(
    {
      type: 'method',
      name(name) {
        return ['loadHomeChartTotals'].includes(name);
      },
      connectionId() {
        return true;
      },
    },
    20,
    240000,
  );

  DDPRateLimiter.addRule(
    {
      type: 'method',
      name(name) {
        return ['createDemo'].includes(name);
      },
      connectionId() {
        return true;
      },
    },
    5,
    3600000,
  );

  DDPRateLimiter.addRule(
    {
      type: 'subscription',
      name(name) {
        return ['timesOnDate'].includes(name);
      },
      connectionId() {
        return true;
      },
    },
    9,
    1000,
  );
}
