const puppeteer = require('puppeteer')
const fetch = require('node-fetch')
const iconv = require('iconv-lite')
const cheerio = require('cheerio')

const NodeCacheSqlite = require('./NodeCacheSqlite.js')

let browser
let browserCloseTimer

async function GetHTML (url, options = {}) {

  if ((url.endsWith('.txt') || url.endsWith('.csv')) && !options.crawler) {
    options.crawler = 'fetch'
  }

  let {
    cacheDay = 0.5, 
    encoding = null,
    crawler = 'puppeteer', // fetch or puppeteer or xml
    puppeteerArgs = ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=800,600'],
    puppeteerAgent,
    puppeteerWaitUntil = `networkidle2`,
    puppeteerWaitForSelector,
    puppeteerWaitForSelectorTimeout = 30000,
    retry = 0,
  } = options

  if (retry > 10) {
    throw Error ('GetHTML failed: ' + url)
  }

  if (crawler === 'xml') {
    let fetchOptions = {...options}
    fetchOptions.crawler = 'fetch'
    let output = await GetHTML(url, fetchOptions);

    let $xml = cheerio.load(output, {
      xmlMode: true
    })

    return $xml
  }

  return await NodeCacheSqlite.get('GetHTML', url + '|' + JSON.stringify(options), async function () {
    console.log('GetHTML', url, crawler)

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
      try {
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
      
        clearTimeout(browserCloseTimer)
        browserCloseTimer = setTimeout(async () => {
          await browser.close();
          browser = null
        }, 10 * 1000)
        
        return output
      }
      catch (e) {
        console.error(e)

        options.retry++

        return await GetHTML(url, options)
      } 
    }
  }, parseInt(cacheDay * 1000 * 60 * 60 * 24, 10))
}

module.exports = GetHTML