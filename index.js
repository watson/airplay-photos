'use strict'

var util = require('util')
var EventEmitter = require('events').EventEmitter
var airplay = require('airplay-server')
var raop = require('raop-stub')
var Patterns = require('patterns')
var plist = require('plist')

module.exports = function (name) {
  return new AirplayPhotos(name)
}

var AirplayPhotos = function (name) {
  if (!(this instanceof AirplayPhotos)) return new AirplayPhotos(name)

  EventEmitter.call(this)

  var self = this

  name = name || 'Node.js'

  var patterns = Patterns()
  patterns.add('PUT /photo', photo)
  // This endpoint is used for video, but the iPhone will try and connect in case
  // the user wants to use the video features
  patterns.add('GET /server-info', serverInfo)

  // The RAOP server needs to be running for the iPhone to accept this server as
  // valid
  raop(name, function (err) {
    if (err) throw err
  })

  this.server = airplay(name, function (req, res) {
    var match = patterns.match(req.method + ' ' + req.url)

    if (!match) {
      res.writeHead(404)
      res.end()
      return
    }

    var fn = match.value
    req.params = match.params

    fn(req, res)
  })

  var airplayTxt
  this.server.on('txt', function (txt) {
    airplayTxt = txt
  })

  this.server.listen(7000)

  function serverInfo (req, res) {
    var txt = airplayTxt

    var opts = {
      deviceid: txt.deviceid,
      features: 268438015,
      vv: '1',
      rhd: '1.06.5',
      pw: '0',
      srcvers: '150.33',
      rmodel: 'MacBookair4,2',
      model: 'AppleTV3,1',
      protovers: '1.0'
    }

    var body = plist.build(opts)

    res.setHeader('Content-Type', 'text/x-apple-plist+xml')
    res.setHeader('Content-Length', body.length)
    res.end(body)
  }

  function photo (req, res) {
    self.emit('photo', req)
  }
}

util.inherits(AirplayPhotos, EventEmitter)

AirplayPhotos.prototype.unref = function () {
  // TODO: The mDNS servers are still holding up the event loop, so this
  // doesn't really work. When the mDNS servers are updated to allow unref'ing,
  // this function should be updated accordingly
  this.server.unref()
}
