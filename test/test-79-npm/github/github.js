'use strict';

var GitHubApi = require('github');
var github = new GitHubApi();
github.users.getForUser({
  username: 'igorklopov'
}, function (error, res) {
  if (error) return;
  if (res.data.name === 'Igor Klopov') {
    console.log('ok');
  }
});
