const Quill = require('quill')
const moment = require('moment')
const {QUILL_CONFIG} = require('./constants')
require('./ga')

const $time = document.getElementsByClassName('time')[0]
const $date = document.getElementsByClassName('date')[0]
const $birch = document.getElementsByClassName('birch')[0]

const getTab = () => {
  return new Promise(resolve => {
    chrome.tabs.getCurrent(tab => resolve(tab))
  })
}

class Birch {
  constructor () {
    this.setTime = this.setTime.bind(this)
    this.save = this.save.bind(this)
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this)

    this.isActiveTab = true
    this.birchContents = null
    this.birchHidden = null

    getTab()
    .then((tab) => {
      this.tabInfo = {
        tabId: tab.id,
        windowId: tab.windowId
      }

      this.updateFromStorage()
      .then(() => {
        this.interval = setInterval(this.save, 100)
        this.addEventListeners()
      })
    })

    this.setTime()
    setInterval(this.setTime, 30000)
  }

  addEventListeners() {
    document.addEventListener('click', () => this.quill.focus())
    window.addEventListener('beforeunload', this.handleBeforeUnload)
    chrome.tabs.onActivated.addListener((info) => {
      const isActiveTab = info.tabId === this.tabInfo.tabId && info.windowId === this.tabInfo.windowId
      if (isActiveTab) this.updateFromStorage()
      this.isActiveTab = isActiveTab
    })

    $birch.addEventListener('click', () => {
      this.birchHidden = !this.birchHidden
      this.save()
      this.updateView()
    })
  }

  handleBeforeUnload() {
    clearInterval(this.interval)
    this.interval = null
    chrome.runtime.sendMessage({
      type: 'unload',
      tabInfo: this.tabInfo
    })
  }

  save() {
    if (!this.quill || !this.isActiveTab) return

    chrome.runtime.sendMessage({
      type: 'save',
      birchContents: this.quill.getContents(),
      birchHidden: this.birchHidden,
      tabInfo: this.tabInfo
    })
  }

  updateFromStorage() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['birchHidden', 'birchContents'], e => {
        this.birchHidden = !!e.birchHidden
        this.birchContents = e.birchContents

        this.updateView()
        setTimeout(() => document.body.classList.add('is-loaded'), 0)

        resolve()
      })
    })
  }

  updateView() {
    document.body.classList.toggle('is-hidden', this.birchHidden)

    if (!this.quill) {
      this.quill = new Quill('.editor', QUILL_CONFIG)
      this.quill.root.spellcheck = false
    }

    if (this.birchContents) {
      this.quill.setContents(this.birchContents)
    }
  }

  setTime() {
    const now = moment()
    $time.textContent = now.format('hh:mm A')
    $date.textContent = now.format('dddd, MMMM Do, YYYY')
  }
}

new Birch()
