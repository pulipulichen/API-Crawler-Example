module.exports = function (html)
{
   html = html.replace(/<[^>]*>?/gm, ' ');
   while (html.indexOf('  ') > -1) {
     html = html.replace(/  /g, ' ')
   }
   return html.trim()
}