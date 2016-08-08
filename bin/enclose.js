#!/usr/bin/env node

/* eslint-disable no-continue */

"use strict";

var fs = require("fs");
var path = require("path");
var assert = require("assert");
var spawn = require("child_process").spawn;
var spawnSync = require("child_process").spawnSync;
var binariesJsonName = "binaries.json";
var binariesJson;

try {
  binariesJson = JSON.parse(
    fs.readFileSync(
      path.join(
        __dirname,
        binariesJsonName
      )
    ), "utf8"
  );
} catch (_) {
  assert(_);
}

function getSuffix(arch) {
  return {
    win32: {
      x86: "win32",
      x64: "win64"
    },
    linux: {
      x86: "linux-x86",
      x64: "linux-x64",
      armv6: "linux-armv6",
      armv7: "linux-armv7"
    },
    darwin: {
      x86: "darwin-x86",
      x64: "darwin-x64"
    }
  }[process.platform][arch];
}

function argsToObject(args) {
  var o = { other: [] };
  for (var i = 0; i < args.length;) {
    var n = args[i];
    if (i + 1 < args.length) {
      var v = args[i + 1];
      if (n === "-a" || n === "--arch") {
        o.arch = v;
        i += 2;
        continue;
      }
      if (n === "-v" || n === "--version") {
        o.version = v;
        i += 2;
        continue;
      }
      if (n === "-l" || n === "--loglevel") {
        o.loglevel = v;
        i += 2;
        continue;
      }
    }
    o.other.push(n);
    i += 1;
  }
  return o;
}

function objectToArgs(argo) {
  var s = argo.other.slice();
  if (argo.arch) s.push("-a", argo.arch);
  if (argo.version) s.push("-v", argo.version);
  if (argo.loglevel) s.push("-l", argo.loglevel);
  return s;
}

function getArmArch() {
  var cpu = fs.readFileSync("/proc/cpuinfo", "utf8");
  if (cpu.indexOf("vfpv3") >= 0) return "armv7";
  var name = cpu.split("model name")[1];
  if (name) name = name.split(":")[1];
  if (name) name = name.split("\n")[0];
  if (name && name.indexOf("ARMv7") >= 0) return "armv7";
  return "armv6";
}

function getArch() {
  var arch = process.arch;
  if (arch === "ia32") arch = "x86";
  if (arch === "arm") arch = getArmArch();
  return arch;
}

function getVersion() {
  return "modules" + process.versions.modules;
}

function argsToObjectDefaults(args) {
  var o = argsToObject(args);
  if (!o.arch) o.arch = getArch();
  if (!o.version) o.version = getVersion();
  return o;
}

function getBinary(version, suffix) {
  var bjs = binariesJson[suffix];
  if (!bjs) return null;
  var v = version;
  if (!bjs[v]) v = "v" + v;
  var bjsv = bjs[v];
  var link = (typeof bjsv === "string");
  if (link) return getBinary(bjsv, suffix);
  if (bjsv) bjsv.version = v;
  return bjsv;
}

function getBinaryFromArgs(args) {

  var argo = argsToObjectDefaults(args);

  if (!binariesJson) {
    throw new Error(
      "File '" + binariesJsonName +
      "' not found. Reinstall EncloseJS"
    );
  }

  var arch = argo.arch;
  var suffix = getSuffix(arch);
  var version = argo.version;
  var binary = getBinary(version, suffix);

  if (!binary) {
    throw new Error(
      "Bad version '" + version + "' or " +
      "architecture '" + arch + "'. " +
      "See file '" + binariesJsonName + "'"
    );
  }

  binary.suffix = suffix;
  return binary;

}

function handleSpawnError(error, full, binary) {

  if (fs.existsSync(full)) {
    throw new Error(
     "Your OS does not support " +
      binary.version + "-" + binary.suffix + ". " +
      "Modify your --arch flag."
    );
  } else {
    if (error.code === "ENOENT") {
      throw new Error(
       "Compiler not found for " +
        binary.version + "-" + binary.suffix + ". " +
       "Expected " + full
      );
    } else {
      throw error;
    }
  }

}

var exec = function(args, cb) {

  if (!cb) {
    cb = function(error) {
      if (error) throw error;
    };
  }

  if (!args) args = [];
  var binary;

  try {
    binary = getBinaryFromArgs(args);
  } catch (error) {
    return cb(error);
  }

  var full = path.join(
    __dirname,
    binary.enclose.name
  );

  var opts = { stdio: "inherit" };
  var c = spawn(full, args, opts);
  var counter = 0;

  c.on("error", function(error) {
    assert(counter === 0);
    counter += 1;
    try {
      handleSpawnError(error, full, binary);
    } catch (error2) {
      return cb(error2);
    }
  });

  c.on("exit", function(status) {
    if (counter) return;
    cb(null, status);
  });

};

exec.sync = function(args, inspect) {

  if (!args) args = [];
  var binary = getBinaryFromArgs(args);

  var full = path.join(
    __dirname,
    binary.enclose.name
  );

  var stdio = inspect || "inherit";
  var opts = { stdio: stdio };
  var c = spawnSync(full, args, opts);
  var error = c.error;

  if (error) {
    return handleSpawnError(error, full, binary);
  }

  return inspect ? c : c.status;

};

function children(o, cb) {
  Object.keys(o).some(
    function(k) {
      cb(o[k], k);
    }
  );
}

function downloads() {

  var arch = getArch();

  var suffixes = {
    x86: [ "x86" ],
    x64: [ "x86", "x64" ],
    armv6: [ "armv6" ],
    armv7: [ "armv6", "armv7" ]
  }[arch].map(getSuffix);

  if (!suffixes) {
    throw new Error(
      "Unknown arch " + arch
    );
  }

  var items = [];

  children(binariesJson, function(suffix, key) {
    if (suffixes.indexOf(key) < 0) return; // *****
    children(suffix, function(version) {
      if (typeof version !== "object") return;
      children(version, function(binary) {
        items.push(binary);
      });
    });
  });

  return items;

}

if (module.parent) {
  module.exports = {
    exec: exec,
    downloads: downloads,
    argsToObject: argsToObject,
    objectToArgs: objectToArgs,
    arch: getArch
  };
} else {
  exec(
    process.argv.slice(2)
  );
}
