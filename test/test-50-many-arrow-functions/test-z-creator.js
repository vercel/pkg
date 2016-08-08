#!/usr/bin/env node

"use strict";

var s = "function EventEmitter() {\n" +
        "  this.listeners = [];\n" +
        "}\n" +
        "EventEmitter.prototype.on = function(name, listener) {\n" +
        "  this.listeners.push(listener);\n" +
        "};\n" +
        "EventEmitter.prototype.emit = function(name, data) {\n" +
        "  this.listeners.some((listener) => {\n" +
        "    listener(data);\n" +
        "  });\n" +
        "};\n" +
        "var ee = new EventEmitter();\n";

for (var i = 0; i < 140; i += 1) {
  s += "ee.on(\"message\", (data) => { console.log(data); });\n";
}

s += "ee.emit(\"message\", \"hooray\");\n";

s = "#!/usr/bin/env node\n" +
    "\"use strict\";\n" + s;

require("fs").writeFileSync(
  "test-x-index.js", s
);
