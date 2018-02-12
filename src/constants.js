const QUILL_CONFIG = {
  theme: 'snow',
  bounds: '.editor',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike', 'code', 'link'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
      ['align', {'align': 'center'}, {'align': 'right'}]
    ]
  },
  formats: [
    'bold',
    'code',
    'italic',
    'underline',
    'strike',
    'link',
    'list',
    'indent',
    'align'
  ],
  placeholder: 'Welcome to Birch. Click anywhere to start typing.'
}

const BIRCH_OPTIONS = {
  'font-size': ['11px', '12px', '13px', '14px'],
  'font-family': ['monospace', 'sans-serif', 'serif'],
  'line-height': ['1.4', '1.6', '1.8', '2'],
  'letter-spacing': ['0ch', '0.1ch', '0.2ch'],
  'time format': ['24hr', '12hr']
}

const BIRCH_DEFAULT_OPTIONS = {
  'font-size': '12px',
  'font-family': 'monospace',
  'line-height': '1.6',
  'letter-spacing': '0.1ch',
  'time format': '12hr'
}

const BIRCH_STYLE_TEMPLATE = `
  p, li {
    font-size: @font-size !important;
    font-family: @font-family !important;
    line-height: @line-height !important;
    letter-spacing: @letter-spacing !important;
  }
`

const IS_EXTENSION = !!chrome.runtime.id

module.exports = {
  QUILL_CONFIG,
  BIRCH_OPTIONS,
  BIRCH_DEFAULT_OPTIONS,
  BIRCH_STYLE_TEMPLATE,
  IS_EXTENSION
}
