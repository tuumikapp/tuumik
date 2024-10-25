/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Times, Projects, Tenants } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

Meteor.methods({
  async timeInsert(selDate, startMinute) {
    check(selDate, Date);
    check(startMinute, Number);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    if (startMinute < 0 || startMinute > 1440 || !Number.isInteger(startMinute)) throw new Meteor.Error('403', 'Incorrect start minute');
    if (selDate.getUTCHours() !== 0 || selDate.getUTCMinutes() !== 0 || selDate.getUTCSeconds() !== 0 || selDate.getUTCMilliseconds() !== 1) {
      throw new Meteor.Error('403', 'Incorrect date format');
    }

    const tenant = await Tenants.findOneAsync(user.tenantId);
    const { trackerStep } = tenant;
    const step = trackerStep === 1 || trackerStep === 6 ? 18 : trackerStep;
    const endMinute = startMinute < 1440 - step - 1 ? startMinute + step : 1440;

    const doc = {
      date: selDate,
      owner: user._id,
      startMinute,
      endMinute,
      plan: false,
      tagColor: '',
      tagText: '',
      lastModified: new Date(),
    };

    if (tenant?.useTaskTypesByDefault) doc.useTaskType = true;

    if (user.defaultProjectId) {
      doc.projectId = user.defaultProjectId;
    } else if (user.defaultClientId) {
      doc.clientId = user.defaultClientId;
    }

    if (Meteor.isServer) doc.tenantId = user.tenantId;

    const timeId = await Times.insertAsync(doc);
    return { timeId };
  },
  async timeInsertCopy(sourceTimeId, startMinute) {
    check(sourceTimeId, String);
    check(startMinute, Number);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    if (startMinute < 0 || startMinute > 1440 || !Number.isInteger(startMinute)) throw new Meteor.Error('403', 'Incorrect start minute');

    const tenant = await Tenants.findOneAsync(user.tenantId);
    const { trackerStep } = tenant;
    const step = trackerStep === 1 ? 6 : trackerStep;
    const endMinute = startMinute < 1440 - step - 1 ? startMinute + step : 1440;

    const sourceTime = await Times.findOneAsync({
      _id: sourceTimeId,
      owner: user._id,
    });

    if (!sourceTime) throw new Meteor.Error('404', 'No source time found');

    const doc = {
      date: sourceTime.date,
      owner: user._id,
      startMinute,
      endMinute,
      plan: false,
      tagColor: '',
      tagText: '',
      lastModified: new Date(),
    };

    if (sourceTime.useTaskType) doc.useTaskType = sourceTime.useTaskType;
    if (sourceTime.clientId) doc.clientId = sourceTime.clientId;
    if (sourceTime.projectId) doc.projectId = sourceTime.projectId;
    if (sourceTime.taskType) doc.taskType = sourceTime.taskType;
    if (sourceTime.taskDesc) {
      doc.taskDesc = sourceTime.taskDesc;
      doc.taskDescNormalized = normalizeStringForAC(sourceTime.taskDesc);
    }
    if (sourceTime.hideHistory) doc.hideHistory = sourceTime.hideHistory;
    if (sourceTime.intCom) doc.intCom = sourceTime.intCom;
    if (Meteor.isServer) doc.tenantId = user.tenantId;

    await Times.insertAsync(doc);
  },
  async timeRemove(timeId) {
    check(timeId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    const query = { _id: timeId, owner: user._id };
    if (Meteor.isServer) query.tenantId = user.tenantId;
    await Times.removeAsync(query);
  },
  async timeSetPlan(timeId, plan) {
    check(timeId, String);
    check(plan, Boolean);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    const query = { _id: timeId, owner: user._id };
    if (Meteor.isServer) query.tenantId = user.tenantId;
    await Times.updateAsync(query, {
      $set: { plan, lastModified: new Date() },
    });
  },
  async timeResizeTop(timeId, startMinute) {
    check(timeId, String);
    check(startMinute, Number);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    if (startMinute < 0 || startMinute > 1440 || !Number.isInteger(startMinute)) throw new Meteor.Error('403', 'Incorrect start minute');

    const query = { _id: timeId, owner: user._id };
    if (Meteor.isServer) query.tenantId = user.tenantId;
    await Times.updateAsync(query, {
      $set: { startMinute, lastModified: new Date() },
    });
  },
  async timeResizeBottom(timeId, endMinute) {
    check(timeId, String);
    check(endMinute, Number);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    if (endMinute < 1 || endMinute > 1440 || !Number.isInteger(endMinute)) throw new Meteor.Error('403', 'Incorrect end minute');

    const query = { _id: timeId, owner: user._id };
    if (Meteor.isServer) query.tenantId = user.tenantId;
    await Times.updateAsync(query, {
      $set: { endMinute, lastModified: new Date() },
    });
  },
  async timeStartAndEnd(timeId, startMinute, endMinute) {
    check(timeId, String);
    check(startMinute, Number);
    check(endMinute, Number);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    if (startMinute < 0 || startMinute > 1440 || !Number.isInteger(startMinute)) throw new Meteor.Error('403', 'Incorrect start minute');
    if (endMinute < 1 || endMinute > 1440 || !Number.isInteger(endMinute)) throw new Meteor.Error('403', 'Incorrect end minute');
    if (endMinute < startMinute) throw new Meteor.Error('403', 'End must be after start');

    const query = { _id: timeId, owner: user._id };
    if (Meteor.isServer) query.tenantId = user.tenantId;
    await Times.updateAsync(query, {
      $set: { startMinute, endMinute, lastModified: new Date() },
    });
  },
  async timeMove(timeId, startMinute) {
    check(timeId, String);
    check(startMinute, Number);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    if (startMinute < 0 || startMinute > 1440 || !Number.isInteger(startMinute)) throw new Meteor.Error('403', 'Incorrect start minute');

    const currentTime = await Times.findOneAsync({ _id: timeId, owner: user._id });
    const endMinute = startMinute + currentTime.endMinute - currentTime.startMinute;

    const query = { _id: timeId, owner: user._id };
    if (Meteor.isServer) query.tenantId = user.tenantId;
    await Times.updateAsync(query, {
      $set: {
        startMinute,
        endMinute,
        lastModified: new Date(),
      },
    });
  },
  async timeClientId(timeId, clientId) {
    check(timeId, String);
    check(clientId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    const query = { _id: timeId, owner: user._id };
    if (Meteor.isServer) query.tenantId = user.tenantId;
    await Times.updateAsync(query, {
      $set: { clientId, lastModified: new Date() },
    });
  },
  async timeProjectId(timeId, projectId) {
    check(timeId, String);
    check(projectId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    const selProject = await Projects.findOneAsync({ _id: projectId });
    if (Meteor.isServer && !selProject) throw new Meteor.Error('404', 'Cannot find selected project');

    const unsetObj = { clientId: '' };
    const setObj = { projectId, lastModified: new Date() };

    if (Meteor.isServer && selProject.useTaskTypes) {
      setObj.useTaskType = true;
    } else {
      unsetObj.useTaskType = '';
    }

    const query = { _id: timeId, owner: user._id };
    if (Meteor.isServer) query.tenantId = user.tenantId;
    await Times.updateAsync(query, { $unset: unsetObj, $set: setObj });
  },
  async timeClearClient(timeId) {
    check(timeId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    const query = { _id: timeId, owner: user._id };
    if (Meteor.isServer) query.tenantId = user.tenantId;
    await Times.updateAsync(query, {
      $unset: { projectId: '', clientId: '' },
      $set: { lastModified: new Date() },
    });
  },
  async timeClearProject(timeId) {
    check(timeId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    const curTime = await Times.findOneAsync({ _id: timeId, owner: user._id });
    const curProject = await Projects.findOneAsync({ _id: curTime.projectId });
    const { clientId } = curProject;

    const query = { _id: timeId, owner: user._id };
    if (Meteor.isServer) query.tenantId = user.tenantId;
    await Times.updateAsync(query, {
      $unset: { projectId: '' },
      $set: { clientId, lastModified: new Date() },
    });
  },
  async timeTaskType(timeId, taskType) {
    check(timeId, String);
    check(taskType, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    const query = { _id: timeId, owner: user._id };
    if (Meteor.isServer) query.tenantId = user.tenantId;
    await Times.updateAsync(query, {
      $set: { taskType, lastModified: new Date() },
    });
  },
  async timeTaskDesc(timeId, taskDesc) {
    check(timeId, String);
    check(taskDesc, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    if (taskDesc.length > 500) throw new Meteor.Error('403', 'Task description length limit exceeded');

    const query = { _id: timeId, owner: user._id };
    if (Meteor.isServer) query.tenantId = user.tenantId;
    await Times.updateAsync(query, {
      $set: {
        taskDesc,
        taskDescNormalized: normalizeStringForAC(taskDesc),
        lastModified: new Date(),
      },
    });
  },
  async timeIntCom(timeId, intCom) {
    check(timeId, String);
    check(intCom, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    if (intCom.length > 500) throw new Meteor.Error('403', 'Internal comment length limit exceeded');

    const query = { _id: timeId, owner: user._id };
    if (Meteor.isServer) query.tenantId = user.tenantId;
    await Times.updateAsync(query, { $set: { intCom, lastModified: new Date() } });
  },
  async timeHideHistory(timeId, hideHistory) {
    check(timeId, String);
    check(hideHistory, Boolean);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    if (hideHistory) {
      if (hideHistory.length > 500) throw new Meteor.Error('403', 'Internal comment length limit exceeded');

      const query = { _id: timeId, owner: user._id };
      if (Meteor.isServer) query.tenantId = user.tenantId;
      await Times.updateAsync(query, {
        $set: { hideHistory, lastModified: new Date() },
      });
    } else {
      const query = { _id: timeId, owner: user._id };
      if (Meteor.isServer) query.tenantId = user.tenantId;
      await Times.updateAsync(query, {
        $unset: { hideHistory: '' },
        $set: { lastModified: new Date() },
      });
    }
  },
  async timeFillData(timeId, projectId, taskType, taskDesc, useTaskType) {
    check(timeId, String);
    check(projectId, String);

    check(taskType, String);
    check(taskDesc, String);
    check(useTaskType, Boolean);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    if (taskDesc.length > 500) throw new Meteor.Error('403', 'Task description length limit exceeded');

    const setFields = {
      projectId,
      taskType,
      taskDesc,
      taskDescNormalized: normalizeStringForAC(taskDesc),
      lastModified: new Date(),
    };

    const query = { _id: timeId, owner: user._id };
    if (Meteor.isServer) query.tenantId = user.tenantId;
    await Times.updateAsync(query, { $set: setFields });
  },
});
