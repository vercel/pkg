'use strict';

var NodeGit = require('nodegit');
var Diff = NodeGit.Diff;

NodeGit.Repository.init('./', 0)
  .then(function (repo) {
    return Diff.indexToWorkdir(repo, null, {
      flags: Diff.OPTION.INCLUDE_UNTRACKED | Diff.OPTION.RECURSE_UNTRACKED_DIRS,
    });
  })
  .then(function () {
    console.log('ok');
  });
