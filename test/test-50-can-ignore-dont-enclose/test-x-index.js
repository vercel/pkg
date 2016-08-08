#!/usr/bin/env node

/* eslint-disable brace-style */
/* eslint-disable camelcase */
/* eslint-disable max-statements-per-line */
/* eslint-disable no-empty */

"use strict";

try { require.resolve("some-s"); } catch (_) {}
try { require.resolve("some-s-ci", "can-ignore"); } catch (_) {}
try { require.resolve("some-s-de", "dont-enclose"); } catch (_) {}
try { require("some-s"); } catch (_) {}
try { require("some-s-ci", "can-ignore"); } catch (_) {}
try { require("some-s-de", "dont-enclose"); } catch (_) {}

var some_v = "some";
var some_v_ci = "some";
var some_v_de = "some";

try { require.resolve(some_v); } catch (_) {}
try { require.resolve(some_v_ci, "can-ignore"); } catch (_) {}
try { require.resolve(some_v_de, "dont-enclose"); } catch (_) {}
try { require(some_v); } catch (_) {}
try { require(some_v_ci, "can-ignore"); } catch (_) {}
try { require(some_v_de, "dont-enclose"); } catch (_) {}

require.resolve(some_v);
require.resolve(some_v_ci, "can-ignore");
require.resolve(some_v_de, "dont-enclose");
require.resolve(some_v, some_v);
require.resolve(some_v, "can-can");
require(some_v);
require(some_v_ci, "can-ignore");
require(some_v_de, "dont-enclose");
require(some_v, some_v);
require(some_v, "can-can");

require.resolve("./test-y-index.js");
require("./test-y-index.js");
