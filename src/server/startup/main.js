import { Meteor } from 'meteor/meteor';
import ensureEnvironmentVariables from '/src/server/startup/ensure-env.js';
import bootstrap from './bootstrap';
import setRateLimits from '/src/server/security/rate-limits.js';
import setMongoIndices from '/src/server/indices/indices.js';
import initGlobalSettings from '/src/server/initdata/global.js';

ensureEnvironmentVariables();
bootstrap();

Meteor.startup(async () => {
  setRateLimits();
  setMongoIndices();
  await initGlobalSettings();
});
