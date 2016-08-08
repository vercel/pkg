#!/usr/bin/env node

/* eslint-disable no-process-env */

"use strict";

var UPM = false; // USE_PREINSTALLED_MODULES

var fs = require("fs");
var path = require("path");
var assert = require("assert");
var globby = require("globby");
var utils = require("../../utils.js");
var enclose = require("../../").exec;

assert(!module.parent);
assert(__dirname === process.cwd());

var flags = process.argv.slice(2);
var windows = process.platform === "win32";

function applyMetaToRight(right, meta) {
  right = (meta.take === "stderr" ? right.stderr : right.stdout);
  if (meta.take === "last-line") right = right.split("\n").slice(-2).join("\n");
  if (right.slice(-2) === "\r\n") right = right.slice(0, -2);
  if (right.slice(-1) === "\n") right = right.slice(0, -1);
  return right;
}

var stamp = {};

var checklist = fs.readFileSync("checklist.js", "utf-8");
var table = checklist.split("var table = ")[1].split(";")[0];
table = JSON.parse(table);
var changes = checklist.split("var changes = ")[1].split(";")[0];
changes = JSON.parse(changes);

function save() {
  var t = utils.stringify(table, null, 2);
  var c = utils.stringify(changes, null, 2);
  if (c === "[]") c = "[\n]";
  fs.writeFileSync("checklist.js",
    "/* eslint-disable no-unused-vars */\n" +
    "\"use strict\";\n" +
    "var table = " + t + ";\n" +
    "var changes = " + c + ";\n"
  );
}

function stamp2string(s) {
  // platform, arch, modules
  return s.p + "/" + s.a + "/m" + s.m.toString();
}

function update(p, n) {
  if (!table[p]) table[p] = {};
  var row = table[p];
  var ss = stamp2string(stamp);
  var o = row[ss];
  row[ss] = n;
  var nr = n.split(",")[0];
  var or = o ? o.split(",")[0] : "";
  if ((!o) && (nr !== "ok")) {
    changes.push(p + "," + ss + ": new " + n);
  } else
  if ((or !== nr) && (nr !== "ok")) {
    changes.push(p + "," + ss + ": " + o + " -> " + n);
  }
  save();
}

if (!UPM) {

  console.log("Cleaning cache...");

  if (windows) {
    utils.vacuum.sync(path.join(
      process.env.APPDATA, "npm-cache"
    ));
    utils.mkdirp.sync(path.join(
      process.env.APPDATA, "npm-cache"
    ));
  } else {
    utils.exec.sync(
      "npm cache clean"
    );
  }

  utils.mkdirp.sync("z-isolator");

}

(function() {

  console.log("Getting stamp...");

  var input = path.resolve("stamp.js");
  var lucky = path.basename(input).slice(0, -3);
  var output = path.join("z-isolator", lucky + ".exe");

  enclose.sync(flags.concat([
    "--output", output, input
  ]));

  stamp = utils.spawn.sync(
    output
  );

  stamp = JSON.parse(stamp);
  utils.vacuum.sync(output);
  console.log("Stamp is " + JSON.stringify(stamp));
  console.log("Waiting...");
  utils.pause(5);

}());

var dickies = globby.sync([
  "./*/*.js",
  "!./*/*.config.js",
  "!./*/*.meta.js",
  "!./*/gulpfile.js",
  "!./*/*fixture*"
]);

dickies.some(function(dicky) {

  var input = path.resolve(dicky);

  var foldy = path.dirname(input);
  var foldyName = path.basename(foldy);

  var packy = path.basename(input).slice(0, -3);
  var packyName = packy.split("@")[0];
  var packyWildcard = packy.split("@")[1];

  var wordy = packy;
  if (packyName !== foldyName) {
    wordy = foldyName + "/" + wordy;
  }

  var output = path.join("z-isolator", packy + ".exe");

  console.log();
  console.log("*********************************************************");
  console.log("*********************************************************");
  console.log("*********************************************************");

  console.log("Testing " + wordy + "...");

  var metajs = path.join(foldy, packy + ".meta.js");
  metajs = fs.existsSync(metajs) ? require(metajs) : null;

  var meta;

  if (metajs) {
    meta = metajs(stamp);
  } else {
    meta = {};
  }

  var allow;

  if (typeof meta.allow !== "undefined") {
    allow = meta.allow;
  } else {
    allow = true;
  }

  if (!allow) {

    update(wordy, "nop");
    console.log(wordy + " not allowed here!");
    return;

  }

  var version = "";

  if (!UPM) {

    var build = meta.build;
    var earth = packy.replace("-shy", "");
    var moons = meta.moons || [];
    var planets = moons.concat([ earth ]);
    assert(planets.length > 0);
    planets.some(function(planet) {
      console.log("Installing " + planet + "...");
      var successful = false, counter = 10;
      while ((!successful) && (counter > 0)) {
        successful = true;
        try {
          var command = "npm install " + planet;
          if (build) command += " --build-from-source=" + build;
          command += " --unsafe-perm";
          utils.exec.sync(command, { cwd: foldy });
        } catch (__) {
          assert(__);
          utils.vacuum.sync(path.join(foldy, "node_modules"));
          successful = false;
          counter -= 1;
        }
      }
    });

    var packyVersion = JSON.parse(fs.readFileSync(
      path.join(foldy, "node_modules", earth.split("@")[0], "package.json"), "utf8"
    )).version;

    console.log("Version of " + packy + " is " + packyVersion);
    version = "," + packyVersion;

    if (packyWildcard) {
      assert.equal(packyWildcard.split(".").length, 3);
      assert.equal(packyVersion, packyWildcard);
    }

  }

  var right;

  console.log("Running non-enclosed " + wordy + "...");

  try {
    right = utils.spawn.sync(
      "node", [ input ],
      { cwd: path.dirname(input),
        stdio: "super-pipe" }
    );
  } catch (___) {
    right = {
      stdout: "",
      stderr: ___.toString()
    };
  }

  right = applyMetaToRight(right, meta);

  console.log("Result is '" + right + "'");

  if (right !== "ok") {
    update(wordy, "error" + version);
  } else {

    console.log("Compiling " + wordy + "...");

    var config = path.join(foldy, packy + ".config.js");
    config = fs.existsSync(config) ? [ "--config", config ] : [];

    enclose.sync(flags.concat([
      "--output", output, input
    ]).concat(config));

    console.log("Copying addons...");

    var addons = globby.sync(
      path.join(foldy, "node_modules", "**", "*.node")
    );

    addons.some(function(addon) {
      fs.writeFileSync(
        path.join(path.dirname(output), path.basename(addon)),
        fs.readFileSync(addon)
      );
    });

    console.log("Running enclosed " + wordy + "...");

    try {
      right = utils.spawn.sync(
        "./" + path.basename(output), [],
        { cwd: path.dirname(output),
          stdio: "super-pipe" }
      );
    } catch (___) {
      right = {
        stdout: "",
        stderr: ___.toString()
      };
    }

    right = applyMetaToRight(right, meta);
    console.log("Result is '" + right + "'");

    if (right !== "ok") {
      update(wordy, "error" + version);
    } else {
      update(wordy, "ok" + version);
    }

  }

  var rubbishes = globby.sync(
    path.join(path.dirname(output), "**", "*")
  );

  rubbishes.some(function(rubbish) {
    utils.vacuum.sync(rubbish);
  });

  if (!UPM) {

    console.log("Cleanup...");
    utils.vacuum.sync(path.join(foldy, "node_modules"));

  }

});
