var test = require("tape").test

var filter = require("../")
var spigot = require("stream-spigot")
var concat = require("concat-stream")

test("ctor", function (t) {
  t.plan(2)

  var Filter = filter.ctor(function (record) {
    return !record.skip
  })

  function combine(records) {
    t.equals(records.length, 3, "Correct number of remaining records")
    t.notOk(records.filter(function (r) { return r.skip }).length, "No remaining skip records")
  }

  spigot({objectMode: true}, [
    {foo: "bar"},
    {foo: "baz", skip: true},
    {foo: "bif", skip: true},
    {foo: "blah"},
    {foo: "buzz"},
  ])
    .pipe(new Filter({objectMode: true}))
    .pipe(concat(combine))
})

test("ctor options", function (t) {
  t.plan(7)

  var Filter = filter.ctor({objectMode: true, foo: "bar"}, function (record) {
    t.equals(this.options.foo, "bar", "Can see options")
    return !record.skip
  })

  function combine(records) {
    t.equals(records.length, 3, "Correct number of remaining records")
    t.notOk(records.filter(function (r) { return r.skip }).length, "No remaining skip records")
  }

  spigot({objectMode: true}, [
    {foo: "bar"},
    {foo: "baz", skip: true},
    {foo: "bif", skip: true},
    {foo: "blah"},
    {foo: "buzz"},
  ])
    .pipe(new Filter())
    .pipe(concat(combine))
})

test("ctor buffer wantStrings", function (t) {
  t.plan(1)

  var re = new RegExp("skip")
  var Filter = filter.ctor({wantStrings: true}, function (chunk) {
    return chunk.length <= 5
  })

  function combine(result) {
    t.equals(result.toString(), "abuvwxyz", "result is correct")
  }

  spigot([
    "a",
    "b",
    "cskipk",
    "lmnopqrstskip",
    "u",
    "vwxyz",
  ]).pipe(new Filter())
    .pipe(concat(combine))
})

test("simple", function (t) {
  t.plan(2)

  var f = filter({objectMode: true}, function (record) {
    return !record.skip
  })

  function combine(records) {
    t.equals(records.length, 3, "Correct number of remaining records")
    t.notOk(records.filter(function (r) { return r.skip }).length, "No remaining skip records")
  }

  spigot({objectMode: true}, [
    {foo: "bar"},
    {foo: "baz", skip: true},
    {foo: "bif", skip: true},
    {foo: "blah"},
    {foo: "buzz"},
  ])
    .pipe(f)
    .pipe(concat(combine))
})

test("simple buffer", function (t) {
  t.plan(1)

  var f = filter({objectMode: true}, function (chunk) {
    return chunk.length <= 5
  })

  function combine(result) {
    t.equals(result.toString(), "abuvwxyz", "result is correct")
  }

  spigot([
    "a",
    "b",
    "cdefghijk",
    "lmnopqrst",
    "u",
    "vwxyz",
  ]).pipe(f)
    .pipe(concat(combine))
})

test("simple buffer wantStrings", function (t) {
  t.plan(1)

  var re = new RegExp("skip")
  var f = filter({wantStrings: true}, function (chunk) {
    return chunk.length <= 5
  })

  function combine(result) {
    t.equals(result.toString(), "abuvwxyz", "result is correct")
  }

  spigot([
    "a",
    "b",
    "cskipk",
    "lmnopqrstskip",
    "u",
    "vwxyz",
  ]).pipe(f)
    .pipe(concat(combine))
})

test("simple index", function (t) {
  t.plan(1)

  var f = filter({objectMode: true}, function (record, index) {
    return index < 2
  })

  function combine(records) {
    t.deepEquals(records, [{foo: "bar"},{foo: "baz"}], "Expected content")
  }

  spigot({objectMode: true}, [
    {foo: "bar"},
    {foo: "baz"},
    {foo: "bif"},
    {foo: "blah"},
    {foo: "buzz"},
  ])
    .pipe(f)
    .pipe(concat(combine))
})