export default () => ({
  kdxf: {
    appId: process.env.KDXF_APP_ID,
    apiSecret: process.env.KDXF_APP_SECRET,
    apiKey: process.env.KDXF_APP_KEY,
  },
  baidu: {
    appId: process.env.BAIDU_AIP_APP_ID,
    accessKey: process.env.BAIDU_AIP_ACCESS_KEY,
    accessSecret: process.env.BAIDU_AIP_ACCESS_SECRET,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  proxy: {
    host: process.env.PROXY_HOST,
    port: process.env.PROXY_PORT,
  },
  sqlLogging: process.env.SQL_LOGGING,
  mysql: {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT, 0),
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWD,
    db: process.env.MYSQL_DB,
  },

  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 0),
    password: process.env.REDIS_PASSWD,
    db: parseInt(process.env.REDIS_DB, 0),
    ttl: parseInt(process.env.REDIS_TTL, 0),
  },
  auth: {
    authingAppId: process.env.AUTHING_APP_ID,
    authingAppHost: process.env.AUTHING_APP_HOST,
    superToken: process.env.SUPER_TOKEN,
  },
});
