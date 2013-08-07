module.exports = make
module.exports.ctor = ctor

var through2 = require("through2")

function ctor(options, fn) {
  if (typeof options == "function") {
    fn = options
    options = {}
  }

  var Filter = through2.ctor(options, function (chunk, encoding, callback) {
    if (this.options.wantStrings) chunk = chunk.toString()
    if (fn.call(this, chunk, this._index++)) this.push(chunk)
    return callback()
  })
  Filter.prototype._index = 0
  return Filter
}

function make(options, fn) {
  return ctor(options, fn)()
}