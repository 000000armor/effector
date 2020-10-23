const {format} = require('prettier')

module.exports = function prettyHtml(content) {
  if (typeof content !== 'string') return content
  try {
    const result = format(content, {parser: 'html', printWidth: 60, semi: true})
      .replace(/"/g, "'")
      .trim()
    return `\n${result}\n`
  } catch (error) {
    return content
  }
}
