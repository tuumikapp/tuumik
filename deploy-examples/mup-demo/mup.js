module.exports = {
  servers: {
    one: {
      host: 'xxx.xxx.xxx.xxx',
      username: 'root',
      // password: 'password',
      // pem: '/home/user/.ssh/id_rsa',
      // or leave blank to authenticate using ssh-agent
    },
  },
  app: {
    name: 'demo',
    path: '../../',
    servers: {
      one: {},
    },
    buildOptions: {
      serverOnly: true,
    },
    env: {
      ROOT_URL: 'https://xxxx.xxxx.com',
      MONGO_URL: 'mongodb://mongodb/meteor',
      MONGO_OPLOG_URL: 'mongodb://mongodb/local',
      DEPLOYMENT_ID: 'mup-demo',
      DEPLOY_CONFIG: 'production',
      HTTP_FORWARDED_COUNT: 1,
      TZ: 'Etc/UTC',
      POSTMARK_MAIN_KEY: '123',
    },
    docker: {
      image: 'zodern/meteor',
    },
    enableUploadProgressBar: true,
  },
  mongo: {
    version: '6.0.3',
    servers: {
      one: {},
    },
  },
  proxy: {
    domains: 'xxxx.xxxx.com',
    ssl: {
      letsEncryptEmail: 'xxxx@xxxx.com',
      forceSSL: true,
    },
  },
};
