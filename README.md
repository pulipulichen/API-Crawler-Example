# API-Crawler-Example
An example to build a crawler by GitHub Action.

# Instruction

1. Fork this repo.
2. Edit `app/index.js`
  * Use `await GetHTML(url, options)` to download the HTML source code.
  * Use `$` jQuery to traverse and manipulate the content.
3. Setup GitHub Pages for Branch `gh-pages`
4. Schedule the job in `.github/workflows/crawler.yml`
# Output API
- https://pulipulichen.github.io/API-Crawler-Example/output.json