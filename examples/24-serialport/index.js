#!/usr/bin/env node

"use strict";

// INFORMATION!
// you can place "serialport.node" near executable file
// and erase "node_modules" directory - and it will work
var SerialPort = require("serialport").SerialPort;

var windows = process.platform === "win32";
var port = windows ? "COM1" : "/dev/ttyS0";

var serialPort = new SerialPort(port, {
  baudrate: 57600
}, false);

serialPort.open(function(error) {
  if (error) throw error;
  console.log("open");
  serialPort.on("data", function(data) {
    console.log("data received", data);
  });
  serialPort.write("ls\n", function(error2, results) {
    if (error2) throw error2;
    console.log("results", results);
  });
});
