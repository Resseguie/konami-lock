var five = require("johnny-five");
var controllers = require('nes-controller')();
var songs = require("j5-songs");

var board = new five.Board({ repl: false });
var solenoid;
var piezo;
var song;
var konamiLength = 10;
var input = [];

if (!controllers[0]) throw new Error("No controller found");

var controller = controllers[0];

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

  ["A", "B"].forEach(function(button) {
    controller.on("press" + button, function() {
      addButton(button.charAt(0));
    });
  });

  controller.on("pressSTART", validateKonami);

  controller.on("analogNS", function(ns) {
    if (ns === 0) { // up
      addButton('u');
    } else if (ns === 255) { // down
      addButton('d'); 
    }
  });

  controller.on("analogEW", function(ew) {
    if (ew === 0) { // left
      addButton('l');
    } else if (ew === 255) { // right
      addButton('r'); 
    }
  });


}

// keeps track of last 10 inputs
function addButton(button) {
  input.shift();
  input.push(button.toLowerCase());
}

// checks last 10 inputs to see if it is Konami Code
function validateKonami() {
  var last10 = input.join("");
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