const dataToStore = {}
const activeInfo = {}

const equal = (obj1, obj2) => {
  for (let i in obj1) {
    if (obj1[i] !== obj2[i]) return false
  }

  return true
}

const requestSync = (e) => {
  if (!equal(e.tabInfo, activeInfo)) return

  dataToStore.birchContents = e.birchContents
  dataToStore.birchHidden = e.birchHidden
  dataToStore.birchOptions = e.birchOptions
  console.log('sync', dataToStore)
}

const storeData = (e) => {
  if (e && !equal(e.tabInfo, activeInfo)) return
  console.log('store', dataToStore)
  chrome.storage.sync.set(dataToStore)
}

chrome.tabs.onRemoved.addListener(storeData)
chrome.tabs.onActivated.addListener((info) => {
  activeInfo.tabId = info.tabId
  activeInfo.windowId = info.windowId
  storeData()
})

chrome.runtime.onMessage.addListener(e => {
  if (e.type === 'save') requestSync(e)
  if (e.type === 'unload') storeData(e)
})
