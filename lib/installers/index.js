/**
 * Installer modülleri index
 */

const mongodb = require('./mongodb');
const cloudron = require('./cloudron');
const docker = require('./docker');
const nginx = require('./nginx');
const postgresql = require('./postgresql');
const redis = require('./redis');
const certbot = require('./certbot');

module.exports = {
  mongodb,
  cloudron,
  docker,
  nginx,
  postgresql,
  redis,
  certbot,
};
