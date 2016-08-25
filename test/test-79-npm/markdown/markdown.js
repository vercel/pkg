'use strict';

var markdown = require('markdown').markdown;
var html = markdown.toHTML('Hello *World*!');
if (html === '<p>Hello <em>World</em>!</p>') {
  console.log('ok');
}
