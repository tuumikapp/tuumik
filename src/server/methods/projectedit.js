/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Projects, Clients, Times, TaskGroups } from '/src/shared/collections/collections.js';
import projectEdit from '/src/server/integrations/project-edit.js';
import projectDelete from '/src/server/integrations/project-delete.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

Meteor.methods({
  async getProjectForEdit(projectId) {
    check(projectId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.projectsEdit) throw new Meteor.Error('403', 'No permission to access project data');

    const projectRes = await Projects.findOneAsync(
      { tenantId: user.tenantId, _id: projectId },
      {
        fields: {
          name: 1,
          clientId: 1,
          taskGroupIds: 1,
          useTaskTypes: 1,
          reminder: 1,
          created: 1,
          createdBy: 1,
          lastModified: 1,
        },
      },
    );

    if (!projectRes) throw new Meteor.Error('404', 'Specified project not found');

    const clientRes = await Clients.findOneAsync({ tenantId: user.tenantId, _id: projectRes.clientId }, { fields: { name: 1 } });
    if (!clientRes) throw new Meteor.Error('500', 'Client for project not found');

    const taskGroupsRes = await TaskGroups.find({ tenantId: user.tenantId }, { fields: { name: 1, default: 1, types: 1 }, sort: { position: 1 } }).fetchAsync();

    return {
      project: { ...projectRes, clientName: clientRes.name },
      taskGroups: taskGroupsRes,
    };
  },
  async projectSave(project) {
    check(project, Object);
    check(project.name, String);
    check(project.clientId, String);
    check(project.taskGroupIds, [String]);
    check(project.useTaskTypes, Boolean);
    check(project.reminder, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.projectsEdit) throw new Meteor.Error('403', 'No permission to modify project data');

    if (project.name.length < 2) throw new Meteor.Error('405', 'Project name must be at least 2 characters');

    const projectId = project._id;
    const setObj = {};
    setObj.name = project.name;
    setObj.nameNormalized = normalizeStringForAC(project.name);
    setObj.clientId = project.clientId;
    setObj.taskGroupIds = project.taskGroupIds;
    setObj.useTaskTypes = project.useTaskTypes;
    setObj.reminder = project.reminder;
    setObj.lastModified = new Date();

    await Projects.updateAsync({ tenantId: user.tenantId, _id: projectId }, { $set: setObj });
    projectEdit({ project });
  },
  async projectDelete(projectId) {
    check(projectId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.projectsEdit) throw new Meteor.Error('403', 'No permission to access project data');

    const time = await Times.findOneAsync({ projectId });
    if (time) throw new Meteor.Error('405', 'Cannot delete project since it has time entries');

    await Meteor.users.updateAsync({ defaultProjectId: projectId }, { $set: { defaultProjectId: '' } });
    await Projects.removeAsync({ tenantId: user.tenantId, _id: projectId });
    projectDelete({ projectId });
  },
});
