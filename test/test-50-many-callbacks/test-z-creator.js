#!/usr/bin/env node

"use strict";

var s = "console.log(\"test\");\n";

for (var i = 0; i < 100; i += 1) {
  s = "setTimeout(function() {\n" + s + "}, 0);\n";
}

s = "#!/usr/bin/env node\n" +
    "\"use strict\";\n" + s;

require("fs").writeFileSync(
  "test-x-index.js", s
);
