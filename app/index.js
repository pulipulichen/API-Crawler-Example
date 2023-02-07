const fs = require('fs')
const Papa = require('papaparse')

const GetHTML = require('./lib/GetHTML.js')
const $ = require('./lib/jQuery.js')

let main = async () => {
  let html = await GetHTML(`https://blog.pulipuli.info`)

  let $html = $(html)

  let titles = []
  $html.find('h1.entry-title').each((i, ele) => {
    titles.push($(ele).text().trim())
  })

  titles = JSON.stringify(titles, null, 2)

  fs.writeFileSync('output/output.json', titles)
}
main()
