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
    name: 'production',
    path: '../../',
    servers: {
      one: {},
    },
    buildOptions: {
      serverOnly: true,
    },
    env: {
      ROOT_URL: 'https://xxxx.xxxx.com',
      MONGO_URL: 'mongodb+srv://mainusername:password@example.mongodb.net/meteor?retryWrites=true&w=majority',
      MONGO_OPLOG_URL: 'mongodb+srv://oplogusername:password@example.mongodb.net/local?retryWrites=true&w=majority',
      DEPLOYMENT_ID: 'mup-prod',
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
  proxy: {
    domains: 'xxxx.xxxx.com',
    ssl: {
      letsEncryptEmail: 'xxxx@xxxx.com',
      forceSSL: true,
    },
  },
};
