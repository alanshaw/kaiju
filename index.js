var five = require("johnny-five")
  , moment = require("moment")

var board = new five.Board()

board.on("ready", function () {

  var last = moment() // Last time a high 5
    , lastOut = "" // Last moment from text

  var lcd = new five.LCD({
    // LCD pin name  RS  EN  DB4 DB5 DB6 DB7
    // Arduino pin # 7    8   9   10  11  12
    pins: [8, 9, 4, 5, 6, 7]

    // Options:
    // bitMode: 4 or 8, defaults to 4
    // lines: number of lines, defaults to 2
    // dots: matrix dimensions, defaults to "5x8"
  })

  lcd.on("ready", function () {

    // Turn the lights on
    lcd.board.digitalWrite(10, lcd.board.io.HIGH)

    // Update the display
    setInterval(function () {
      var out = last.from(moment())
      if (out == lastOut) return

      console.log(out)
      lcd.clear().cursor(0, 0).print("Last high 5:").cursor(1, 0).print(out)
      lastOut = out
    }, 50)
  })

  // Reset the last time when button pressed
  var reset = new five.Button(3)

  reset.on("up", function () {
    last = moment()
    lastOut = ""
  })

  this.repl.inject({
    lcd: lcd
  })

})
