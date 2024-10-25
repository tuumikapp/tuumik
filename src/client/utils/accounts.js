/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Accounts } from 'meteor/accounts-base';

// eslint-disable-next-line no-underscore-dangle
export const hashPassword = password => Accounts._hashPassword(password);
