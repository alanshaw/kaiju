var five = require("johnny-five")
  , moment = require("moment")

var board = new five.Board()

moment.lang("en-gb", {
  relativeTime: {
    future : "in %s",
    past : "%s ago",
    s : "moments",
    m : "a minute",
    mm : "%d minutes",
    h : "an hour",
    hh : "%d hours",
    d : "a day",
    dd : "%d days",
    M : "a month",
    MM : "%d months",
    y : "a year",
    yy : "%d years"
  }
})

board.on("ready", function () {

  var last = moment() // Last time a high 5
    , lastOut = "" // Last moment from text
    , updateDisplayTimeoutId = null

  var lcd = new five.LCD({
    // LCD pin name  RS  EN  DB4 DB5 DB6 DB7
    // Arduino pin # 7    8   9   10  11  12
    pins: [8, 9, 4, 5, 6, 7]

    // Options:
    // bitMode: 4 or 8, defaults to 4
    // lines: number of lines, defaults to 2
    // dots: matrix dimensions, defaults to "5x8"
  })

  function updateDisplay () {
    var now = moment()
      , diff = now.diff(last)
      , out

    if (diff < 11000) {
      out = parseInt(diff / 1000, 10) + " seconds ago"
    } else {
      out = last.from(moment())
    }

    if (out == lastOut) return

    console.log(out)

    lcd.clear()

    // FIXME: Need time between clearing display and printing characters
    setTimeout(function () {
      lcd.cursor(0, 0).print("Last high 5:").cursor(1, 0).print(out)
    }, 50)

    lastOut = out
  }

  function startUpdateDisplay (timeout) {
    console.log("Starting update display")
    function update () {
      updateDisplay()
      updateDisplayTimeoutId = setTimeout(update, timeout || 50)
    }
    setTimeout(update, timeout || 50)
  }

  function stopUpdateDisplay () {
    clearTimeout(updateDisplayTimeoutId)
  }

  function highFive () {
    // Stop updating the display
    stopUpdateDisplay()

    // Flash the lights
    var lowHigh = lcd.board.io.LOW
      , timeout = 0

    function flash (onOff) {
      return function () {
        console.log("Flashing")
        lcd.board.digitalWrite(10, onOff)
      }
    }

    [1, 1, 1, 1, 1].forEach(function () {
      setTimeout(flash(lowHigh), timeout)

      lowHigh = lowHigh == lcd.board.io.LOW ? lcd.board.io.HIGH : lcd.board.io.LOW
      timeout += 250
    })

    // Reset the time
    setTimeout(function () {
      console.log("Resetting")

      lcd.board.digitalWrite(10, lcd.board.io.HIGH)

      last = moment()
      lastOut = ""

      // Restart update display
      startUpdateDisplay()
    }, timeout)
  }

  lcd.on("ready", function () {
    // Turn the lights on
    lcd.board.digitalWrite(10, lcd.board.io.HIGH)

    // Start updating the display
    startUpdateDisplay()
  })

  // Reset the last time when button pressed
  var reset = new five.Button(3)

  reset.on("up", highFive)

  this.repl.inject({
    lcd: lcd
  })

})
