
require('webtools')
  .uglifyjs({
  'input': [
    '../domtemp.js',
    '../attr-scanner.js',
    '../form-scanner.js',
    '../loop-scanner.js'
  ],
  'output': 'domtemp-min.js'
  });
