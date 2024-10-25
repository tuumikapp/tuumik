/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { TaskGroups, Projects } from '/src/shared/collections/collections.js';

Meteor.methods({
  async loadTaskGroups() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');

    const res = await TaskGroups.find(
      { tenantId: user.tenantId },
      {
        fields: { name: 1, position: 1, showByDefault: 1, types: 1 },
        sort: { position: 1 },
      },
    ).fetchAsync();

    return res;
  },
  async loadTaskGroupForEdit(taskGroupId) {
    check(taskGroupId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');

    const res = await TaskGroups.findOneAsync({ tenantId: user.tenantId, _id: taskGroupId }, { fields: { name: 1, position: 1, showByDefault: 1, types: 1 } });
    if (!res) throw new Meteor.Error('404', 'Task group not found');

    return res;
  },
  async insertTaskGroup(name) {
    check(name, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');

    const lastPos = await TaskGroups.findOneAsync({ tenantId: user.tenantId }, { fields: { position: 1 }, sort: { position: -1 } });
    const position = lastPos ? lastPos.position + 1 : 1;

    await TaskGroups.insertAsync({
      tenantId: user.tenantId,
      name,
      position,
      showByDefault: false,
      types: [],
    });
    return Meteor.call('loadTaskGroups');
  },
  async saveTaskGroup(taskGroup) {
    check(taskGroup, Object);
    check(taskGroup._id, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');

    const { name, position, showByDefault, types } = taskGroup;
    await TaskGroups.updateAsync({ tenantId: user.tenantId, _id: taskGroup._id }, { $set: { name, position, showByDefault, types } });
    const res = await Meteor.callAsync('loadTaskGroupForEdit', taskGroup._id);
    return res;
  },
  async deleteTaskGroup(taskGroupId) {
    check(taskGroupId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access task groups');

    const projectsExist = await Projects.findOneAsync({
      tenantId: user.tenantId,
      taskGroupIds: taskGroupId,
    });
    if (projectsExist) throw new Meteor.Error('403', 'Cannot delete task group since it is used in existing projects');

    await TaskGroups.removeAsync({ tenantId: user.tenantId, _id: taskGroupId });
    const res = await Meteor.callAsync('loadTaskGroups');
    return res;
  },
});
