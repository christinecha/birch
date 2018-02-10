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

module.exports = {
  QUILL_CONFIG
}
