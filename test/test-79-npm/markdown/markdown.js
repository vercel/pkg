let markdown = require('markdown').markdown;
let html = markdown.toHTML('Hello *World*!');
if (html === '<p>Hello <em>World</em>!</p>') {
  console.log('ok');
}
