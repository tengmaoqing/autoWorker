const axios = require('axios')
const log4js = require('log4js')
const config = require('../../config')

log4js.configure({
  appenders: { cheese: { type: 'file', filename: 'cheese.log' } },
  categories: { default: { appenders: ['cheese'], level: 'info' } }
});
const logger = log4js.getLogger('cheese')
// logger.debug("Some debug messages")

const http = axios.create({
  headers: {
    Cookie: `shopmallWxCookies_25=${config.kkone.token}`,
    Referer: 'https://servicewechat.com/wxbc62761b146c5f85/42/page-frame.html'
  }
})

http.interceptors.request.use((config) => {
  // config.headers.
  return config
})

http.interceptors.response.use(({ data }) => {
  if (!data) {
    throw new Error('no data')
  }

  const body = data.match(/^jsonpReturn\((.*)\);$/)
  if (!body || !body[1]) {
    throw new Error('not match')
  }
  const nromalizeData = JSON.parse(body[1])
  
  if (nromalizeData.errCode !== 0) {
    throw new Error(nromalizeData.errMsg)
  }
  
  return nromalizeData
})

// debugger
const start = async () => {
  try {
    // configer()
    const info = await http.get('https://woxs.w-lans.com/Webapi/IntegralSign/index?bid=25&istest=no')
    const oneDay = 24 * 60 * 60 * 1000
    if ((+info.result.lastSignTime * 1000) + oneDay >= Date.now() ) {
      logger.warn('还没到时间')
      return
    }

    const signResult = await http.get('https://woxs.w-lans.com/Webapi/IntegralSign/integralAdd?bid=25&istest=no')

    logger.info('sign success!')
  } catch (e) {
    logger.error(e)
  }
}

start()
