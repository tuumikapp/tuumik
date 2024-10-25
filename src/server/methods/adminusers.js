/* Copyright (C) 2017-2024 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import { Times, Tenants, Clients, Projects } from '/src/shared/collections/collections.js';
import { isValidEmailAddress } from '/src/server/utils/validation';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

Meteor.methods({
  async usersList() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');

    return Meteor.users
      .find(
        { tenantId: user.tenantId },
        {
          fields: { name: 1, username: 1, emails: 1, created: 1, disabled: 1 },
          sort: { disabled: 1, name: 1 },
        },
      )
      .fetchAsync();
  },
  async getUserForEdit(userId) {
    check(userId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    const tenant = await Tenants.findOneAsync(user.tenantId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');

    const editedUser = await Meteor.users.findOneAsync(
      { tenantId: user.tenantId, _id: userId },
      {
        fields: {
          name: 1,
          pic: 1,
          emails: 1,
          inOutShow: 1,
          username: 1,
          permissions: 1,
          trackerSimple: 1,
          defaultClientId: 1,
          defaultProjectId: 1,
          inTeams: 1,
          created: 1,
          disabled: 1,
        },
      },
    );

    if (!editedUser) throw new Meteor.Error('404', 'User not found');

    if (editedUser.defaultClientId) {
      const client = await Clients.findOneAsync(editedUser.defaultClientId);
      const name = client ? client.name : '';
      editedUser.defaultClientName = name;
    } else {
      editedUser.defaultClientName = '';
    }

    if (editedUser.defaultProjectId) {
      const project = await Projects.findOneAsync(editedUser.defaultProjectId);
      const name = project ? project.name : '';
      editedUser.defaultProjectName = name;
    } else {
      editedUser.defaultProjectName = '';
    }

    return { editedUser, allowedPermissions: tenant.allowedPermissions };
  },
  async addUser(name, email, password) {
    check(name, String);
    check(email, String);
    check(password, Object);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');
    if (!isValidEmailAddress(email)) throw new Meteor.Error('403', 'Unrecognized email format');

    const permissions = {};

    const profile = {
      tenantId: user.tenantId,
      name,
      nameNormalized: normalizeStringForAC(name),
      permissions,
    };
    const createdUserId = await Accounts.createUserAsync({ email, password, profile });

    return createdUserId;
  },
  async saveUserGeneral(editedUser) {
    check(editedUser, Object);
    check(editedUser._id, String);
    check(editedUser.name, String);
    check(editedUser.pic, String);
    check(editedUser.permissions, Object);
    check(editedUser.trackerSimple, Boolean);
    check(editedUser.defaultClientId, String);
    check(editedUser.defaultProjectId, String);
    check(editedUser.inOutShow, Boolean);
    check(editedUser.inTeams, [String]);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');
    const targetUser = await Meteor.users.findOneAsync({ _id: editedUser._id });
    if (user.tenantId !== targetUser.tenantId) throw new Meteor.Error('403', 'Incorrect tenant');

    const { permissions } = editedUser;
    const perms = {
      timeTracker: !!permissions.timeTracker,
      historyOthers: !!permissions.historyOthers,
      monitor: !!permissions.monitor,
      clientsEdit: !!permissions.clientsEdit,
      projectsEdit: !!permissions.projectsEdit,
      catalog: !!permissions.catalog,
      composer: !!permissions.composer,
      inOutSelf: !!permissions.inOutSelf,
      inOutView: !!permissions.inOutView,
      inOutEditOthers: !!permissions.inOutEditOthers,
      admin: !!permissions.admin,
    };

    if (user._id === targetUser._id && !perms.admin) {
      throw new Meteor.Error('403', 'User cannot remove admin from itself');
    }

    await Meteor.users.updateAsync(
      { tenantId: user.tenantId, _id: editedUser._id },
      {
        $set: {
          name: editedUser.name,
          nameNormalized: normalizeStringForAC(editedUser.name),
          pic: editedUser.pic,
          permissions: perms,
          trackerSimple: editedUser.trackerSimple,
          defaultClientId: editedUser.defaultClientId,
          defaultProjectId: editedUser.defaultProjectId,
          inOutShow: editedUser.inOutShow,
          inTeams: editedUser.inTeams,
        },
      },
    );
  },
  async saveUserUsername(userId, username) {
    check(userId, String);
    check(username, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');

    const targetUser = await Meteor.users.findOneAsync({ _id: userId });
    if (user.tenantId !== targetUser.tenantId) throw new Meteor.Error('403', 'Incorrect tenant');

    await Accounts.setUsername(userId, username);
  },
  async saveUserPassword(userId, password) {
    check(userId, String);
    check(password, Object);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');

    const targetUser = await Meteor.users.findOneAsync({ _id: userId });
    if (user.tenantId !== targetUser.tenantId) throw new Meteor.Error('403', 'Incorrect tenant');

    await Accounts.setPasswordAsync(userId, password, { logout: true });
  },
  async addUserEmail(userId, email) {
    check(userId, String);
    check(email, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');

    const targetUser = await Meteor.users.findOneAsync({ _id: userId });
    if (user.tenantId !== targetUser.tenantId) throw new Meteor.Error('403', 'Incorrect tenant');

    await Accounts.addEmailAsync(userId, email);
  },
  async removeUserEmail(userId, email) {
    check(userId, String);
    check(email, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');

    const targetUser = await Meteor.users.findOneAsync({ _id: userId });
    if (user.tenantId !== targetUser.tenantId) {
      throw new Meteor.Error('403', 'Incorrect tenant');
    }

    await Accounts.removeEmail(userId, email);
  },
  async sendVerifyEmail(userId, email) {
    check(userId, String);
    check(email, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    if (Meteor.settings.public.demoMode) throw new Meteor.Error('401', 'This feature not available in demo mode');

    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');

    const targetUser = await Meteor.users.findOneAsync({ _id: userId });
    if (user.tenantId !== targetUser.tenantId) throw new Meteor.Error('403', 'Incorrect tenant');

    await Accounts.sendVerificationEmail(userId, email);
  },
  async removeUser(userId) {
    check(userId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');
    if (user._id === userId) throw new Meteor.Error('403', 'User cannot delete itself');

    const targetUser = await Meteor.users.findOneAsync({ _id: userId });
    if (user.tenantId !== targetUser.tenantId) throw new Meteor.Error('403', 'Incorrect tenant');

    const timesExist = await Times.findOneAsync({
      tenantId: user.tenantId,
      owner: userId,
    });
    if (timesExist) throw new Meteor.Error('403', 'Cannot delete user since it has existing timesheet entries');

    await Meteor.users.removeAsync({ tenantId: user.tenantId, _id: userId });
  },
  async disableUser(userId) {
    check(userId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');
    if (user._id === userId) throw new Meteor.Error('403', 'User cannot disable itself');

    const targetUser = await Meteor.users.findOneAsync({ _id: userId });
    if (user.tenantId !== targetUser.tenantId) throw new Meteor.Error('403', 'Incorrect tenant');

    const password = String(Math.floor(Math.random() * 100000000000));
    await Accounts.setPasswordAsync(userId, password, { logout: true });

    await Meteor.users.updateAsync({ tenantId: user.tenantId, _id: userId }, { $set: { disabled: true } });
  },
  async enableUser(userId) {
    check(userId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');

    const targetUser = await Meteor.users.findOneAsync({ _id: userId });
    if (user.tenantId !== targetUser.tenantId) throw new Meteor.Error('403', 'Incorrect tenant');

    await Meteor.users.updateAsync({ tenantId: user.tenantId, _id: userId }, { $set: { disabled: false } });
  },
});
