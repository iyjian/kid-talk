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
    endpoint: process.env.OPENAI_ENDPOINT,
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
    endpoint: process.env.AUTH_ENDPOINT,
    superToken: process.env.SUPER_TOKEN,
  },
  wx: {
    appId: process.env.WX_APPID,
    appSecret: process.env.WX_APPSECRET,
  },
})
