#!/usr/bin/env node

/* eslint-disable camelcase */
/* eslint-disable max-statements-per-line */
/* eslint-disable no-empty */

'use strict';

try { require.resolve('rr-some-s'); } catch (_) {}
try { require.resolve('rr-some-s-ci', 'may-exclude'); } catch (_) {}
try { require.resolve('rr-some-s-de', 'must-exclude'); } catch (_) {}
try { require('r-some-s'); } catch (_) {}
try { require('r-some-s-ci', 'may-exclude'); } catch (_) {}
try { require('r-some-s-de', 'must-exclude'); } catch (_) {}

var try_rr_some_v = 'some';
var try_rr_some_v_ci = 'some';
var try_rr_some_v_de = 'some';

var try_r_some_v = 'some';
var try_r_some_v_ci = 'some';
var try_r_some_v_de = 'some';

try { require.resolve(try_rr_some_v); } catch (_) {}
try { require.resolve(try_rr_some_v_ci, 'may-exclude'); } catch (_) {}
try { require.resolve(try_rr_some_v_de, 'must-exclude'); } catch (_) {}
try { require(try_r_some_v); } catch (_) {}
try { require(try_r_some_v_ci, 'may-exclude'); } catch (_) {}
try { require(try_r_some_v_de, 'must-exclude'); } catch (_) {}

var rr_some_v = 'some';
var rr_some_v_ci = 'some';
var rr_some_v_de = 'some';

var r_some_v = 'some';
var r_some_v_ci = 'some';
var r_some_v_de = 'some';

require.resolve(rr_some_v);
require.resolve(rr_some_v_ci, 'may-exclude');
require.resolve(rr_some_v_de, 'must-exclude');
require.resolve(rr_some_v, rr_some_v);
require.resolve(rr_some_v, 'can-can');
require(r_some_v);
require(r_some_v_ci, 'may-exclude');
require(r_some_v_de, 'must-exclude');
require(r_some_v, r_some_v);
require(r_some_v, 'can-can');

require.resolve('./test-y-index.js');
require('./test-y-index.js');
