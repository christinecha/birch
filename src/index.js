const Quill = require('quill')
const moment = require('moment')
const {
  QUILL_CONFIG,
  BIRCH_OPTIONS,
  BIRCH_DEFAULT_OPTIONS,
  BIRCH_STYLE_TEMPLATE,
  IS_EXTENSION
} = require('./constants')
const {
  getTab,
  getElement
} = require('./utils')
require('./ga')

class Birch {
  constructor () {
    this.$editorWrapper = document.getElementsByClassName('editor-wrapper')[0]
    this.$time = document.getElementsByClassName('time')[0]
    this.$date = document.getElementsByClassName('date')[0]
    this.$birch = document.getElementsByClassName('birch')[0]
    this.$menu = document.getElementsByClassName('menu')[0]
    this.$h1 = this.$menu.getElementsByTagName('H1')[0]
    this.$options = document.getElementsByClassName('options')[0]

    this.setTime = this.setTime.bind(this)
    this.save = this.save.bind(this)
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this)
    this.toggleHiddenMode = this.toggleHiddenMode.bind(this)
    this.toggleMenu = this.toggleMenu.bind(this)

    this.isActiveTab = true
    this.birchContents = null
    this.birchHidden = null
    this.birchOptions = BIRCH_DEFAULT_OPTIONS
    this.menuOpen = false

    getTab()
    .then((tab) => {
      if (tab) {
        this.tabInfo = {
          tabId: tab.id,
          windowId: tab.windowId
        }
      }

      this.updateFromStorage()
      .then(() => {
        this.interval = setInterval(this.save, 100)
        this.addEventListeners()
        this.initCustomOptions()
        this.updateView()
      })
    })

    this.setTime()
    setInterval(this.setTime, 30000)
  }

  addEventListeners() {
    this.$editorWrapper.addEventListener('click', () => this.quill.focus())
    window.addEventListener('beforeunload', this.handleBeforeUnload)

    if (IS_EXTENSION) {
      chrome.tabs.onActivated.addListener((info) => {
        const isActiveTab = info.tabId === this.tabInfo.tabId && info.windowId === this.tabInfo.windowId
        if (isActiveTab) this.updateFromStorage()
        this.isActiveTab = isActiveTab
      })
    }

    this.$birch.addEventListener('click', this.toggleHiddenMode)
    this.$h1.addEventListener('click', this.toggleMenu)
  }

  toggleMenu() {
    this.$menu.classList.toggle('is-open')
  }

  toggleHiddenMode() {
    this.birchHidden = !this.birchHidden
    this.save()
    this.updateView()
  }

  initCustomOptions() {
    for (let option in BIRCH_OPTIONS) {
      const $option = getElement('DIV', 'option')
      const $label = getElement('LABEL', '', option)
      $option.dataset.option = option

      const $choicesWrapper = getElement('DIV', 'choices')
      const choices = BIRCH_OPTIONS[option]
      const selection = this.birchOptions[option] || BIRCH_DEFAULT_OPTIONS[option]

      const $choices = choices.map(choice => {
        const $choice = getElement('SPAN', 'choice', choice)
        $choice.dataset.value = choice
        $choice.dataset.selected = selection === choice
        $choicesWrapper.appendChild($choice)
        return $choice
      })

      $option.addEventListener('click', (e) => {
        if (!e.target.dataset.value) return
        this.birchOptions[option] = e.target.dataset.value
        $choices.forEach($c => $c.dataset.selected = 'false')
        e.target.dataset.selected = 'true'
        this.updateView()
      })

      $option.appendChild($label)
      $option.appendChild($choicesWrapper)
      this.$options.appendChild($option)
    }
  }

  handleBeforeUnload() {
    if (!IS_EXTENSION) return

    clearInterval(this.interval)
    this.interval = null
    chrome.runtime.sendMessage({
      type: 'unload',
      tabInfo: this.tabInfo
    })
  }

  save() {
    if (!this.quill || !this.isActiveTab || !IS_EXTENSION) return

    chrome.runtime.sendMessage({
      type: 'save',
      birchContents: this.quill.getContents(),
      birchHidden: this.birchHidden,
      birchOptions: this.birchOptions,
      tabInfo: this.tabInfo
    })
  }

  updateFromStorage() {
    return new Promise((resolve) => {
      if (!IS_EXTENSION) {
        this.updateView()
        document.body.classList.add('is-loaded')
        resolve()
        return
      }

      chrome.storage.sync.get(['birchHidden', 'birchContents', 'birchOptions'], e => {
        this.birchHidden = !!e.birchHidden
        this.birchContents = e.birchContents
        this.birchOptions = e.birchOptions || BIRCH_DEFAULT_OPTIONS

        this.updateView()
        document.body.classList.add('is-loaded')

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

    const $style = document.createElement('STYLE')
    $style.textContent = BIRCH_STYLE_TEMPLATE
    document.body.appendChild($style)

    for (let i in BIRCH_DEFAULT_OPTIONS) {
      let value = this.birchOptions[i] || BIRCH_DEFAULT_OPTIONS[i]
      $style.textContent = $style.textContent.replace(`@${i}`, value)
    }

    if (this.$style) document.body.removeChild(this.$style)
    this.$style = $style

    this.setTime()
  }

  setTime() {
    const now = moment()
    const is24HourTime = this.birchOptions['time format'] === '24hr'
    const timeFormat = is24HourTime ? 'HH:mm' : 'hh:mm A'
    this.$time.textContent = now.format(timeFormat)
    this.$date.textContent = now.format('dddd, MMMM Do, YYYY')
  }
}

new Birch()
