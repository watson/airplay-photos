# airplay-photos

A low level module for getting photos from iDevices.

[![Build status](https://travis-ci.org/watson/airplay-photos.svg?branch=master)](https://travis-ci.org/watson/airplay-photos)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

## Installation

```
npm install airplay-photos
```

## Usage example

Write each file sent from your iDevice to a new file in the current
directory:

```js
var fs = require('fs')
var airplay = require('airplay-photos')('My Photo Bucket')

var photos = 0

airplay.on('photo', function (req) {
  photos++
  var filename = 'picture' + photos + '.jpg'
  var file = fs.createWriteStream(filename)

  req.pipe(file) // do the magic!

  req.on('end', function () {
    console.log(filename)
  })
})
```

## License

MIT
