/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Mongo } from 'meteor/mongo';

export const Global = new Mongo.Collection('global');
export const Tenants = new Mongo.Collection('tenants');
export const TaskGroups = new Mongo.Collection('task-groups');
export const Times = new Mongo.Collection('times');
export const Clients = new Mongo.Collection('clients');
export const Projects = new Mongo.Collection('projects');
export const Statuses = new Mongo.Collection('statuses');
