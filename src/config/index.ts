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
});
