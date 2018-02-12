const { IS_EXTENSION } = require('./constants')

const getTab = () => {
  return new Promise(resolve => {
    if (!IS_EXTENSION) return resolve()
    chrome.tabs.getCurrent(tab => resolve(tab))
  })
}

const getElement = (tag, className, content) => {
  const $el = document.createElement(tag)
  $el.className = className
  $el.textContent = content
  return $el
}

module.exports = {
  getTab,
  getElement
}
