const puppeteer = require('puppeteer')
const fetch = require('node-fetch')
const iconv = require('iconv-lite')

const NodeCacheSqlite = require('./NodeCacheSqlite.js')

let browser

module.exports = async function (url, options = {}) {
  let {
    cacheDay = 0.5, 
    encoding = null,
    crawler = 'puppeteer', // fetch or puppeteer
    puppeteerArgs = ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=800,600'],
    puppeteerAgent,
    puppeteerWaitUntil = `networkidle2`,
    puppeteerWaitForSelector,
    puppeteerWaitForSelectorTimeout = 30000,
  } = options

  return await NodeCacheSqlite.get('GetHTML', url, async function () {
    console.log('GetHTML', url)

    if (crawler === 'fetch') {
      const response = await fetch(url);

      if (!encoding) {
        return await response.text()
      }
      else {
        const buffer = await response.arrayBuffer()
        return iconv.decode(Buffer.from(buffer), encoding)
      }
    }
    else {
      if (!browser) {
        browser = await puppeteer.launch({
          //headless: false,
          args: puppeteerArgs,
          ignoreHTTPSErrors: true,
      
        });
      }
        
      const page = await browser.newPage();
      
      if (puppeteerAgent) {
        await page.setUserAgent(puppeteerAgent);
      }
        
      await page.goto(url, {waitUntil: puppeteerWaitUntil});

      if (puppeteerWaitForSelector) {
        await page.waitForSelector(puppeteerWaitForSelector, {
          timeout: puppeteerWaitForSelectorTimeout
        })
      }

      let output = await page.content()
    
      setTimeout(async () => {
        await browser.close();
        browser = null
      }, 10 * 1000)
      
      return output
    }
  }, parseInt(cacheDay * 1000 * 60 * 60 * 24, 10))
}