#!/usr/bin/env node

/* eslint-disable brace-style */
/* eslint-disable camelcase */
/* eslint-disable max-statements-per-line */
/* eslint-disable no-empty */

'use strict';

try { require.resolve('some-s'); } catch (_) {}
try { require.resolve('some-s-ci', 'may-exclude'); } catch (_) {}
try { require.resolve('some-s-de', 'must-exclude'); } catch (_) {}
try { require('some-s'); } catch (_) {}
try { require('some-s-ci', 'may-exclude'); } catch (_) {}
try { require('some-s-de', 'must-exclude'); } catch (_) {}

var some_v = 'some';
var some_v_ci = 'some';
var some_v_de = 'some';

try { require.resolve(some_v); } catch (_) {}
try { require.resolve(some_v_ci, 'may-exclude'); } catch (_) {}
try { require.resolve(some_v_de, 'must-exclude'); } catch (_) {}
try { require(some_v); } catch (_) {}
try { require(some_v_ci, 'may-exclude'); } catch (_) {}
try { require(some_v_de, 'must-exclude'); } catch (_) {}

require.resolve(some_v);
require.resolve(some_v_ci, 'may-exclude');
require.resolve(some_v_de, 'must-exclude');
require.resolve(some_v, some_v);
require.resolve(some_v, 'can-can');
require(some_v);
require(some_v_ci, 'may-exclude');
require(some_v_de, 'must-exclude');
require(some_v, some_v);
require(some_v, 'can-can');

require.resolve('./test-y-index.js');
require('./test-y-index.js');
