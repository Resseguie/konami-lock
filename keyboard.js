var five = require("johnny-five");
var keypress = require("keypress");
var songs = require("j5-songs");

var board = new five.Board({ repl: false });
var solenoid;
var piezo;
var song;
var konamiLength = 10;
var input = [];


// wait for Arduino to be ready
board.on("ready", function() {
  console.log("Ready!");

  initialize();

  listen();

});

function initialize() {
  // initialize components
  solenoid = new five.Pin(3);
  piezo = new five.Piezo(6);

  // initialize to bad input
  for (var i = 0; i < konamiLength; i++) {
    input[i] = "x";
  }

  // load success tune
  song = songs.load("mario-intro");
}

function listen() {
  keypress(process.stdin);

  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.setRawMode(true);

  process.stdin.on("keypress", function(ch, key) {
    if (!key) { return; }
    if (key.ctrl && key.name === "c") {
      process.exit(0);
    }

    if (key.name === "return") {
      validateKonami();
    } else {
      addKey(key.name);      
    }

  });
}

// keeps track of last 10 inputs
function addKey(key) {
  input.shift();
  input.push(key.charAt(0));
}

// checks last 10 inputs to see if it is Konami Code
function validateKonami() {
  var last10 = input.join("");
  console.log(last10);
  if( last10 === "uuddlrlrba") {
    console.log("Konami!");
    unlock();
  } else {
    console.log("Bad code.");
  }
}

function unlock() {
  piezo.play(song);
  solenoid.high();
  setTimeout(function() {
    solenoid.low();
  }, 5000);

}