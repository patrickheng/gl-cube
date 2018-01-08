const path = require('path')
const budo = require('budo')

budo('src/main.js', {
  serve: 'build/bundle.js',
  live: true,
  open: true,
  dir: 'public',
  stream: process.stdout,
  watchGlob: '**/*.{html,css,frag,vert,glsl}',
  browserify: {
    paths: [
      path.join(__dirname, '/src')
    ],
    insertGlobalVars: {
      THREE: (file, dir) => `require('three')`
    }
  }
})
