'use strict';

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pkg-test');

var Cat = mongoose.model('Cat', { name: String });
var name = 'Tuz' + new Date().getTime().toString();
var kitty = new Cat({ name: name });

kitty.save(function (error1) {
  if (error1) return;
  Cat.find({})
    .$where(function () {
      return this.name.slice(0, 3) === 'Tuz';
    })
    .exec(function (error2, cats) {
      if (process.pkg) {
        if (cats) return;
        if (error2.message.indexOf('Pkg') >= 0) {
          console.log('ok');
          mongoose.disconnect();
        }
      } else {
        if (error2) return;
        if (cats.length > 0) {
          console.log('ok');
          mongoose.disconnect();
        }
      }
    });
});
