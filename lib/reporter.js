let assert = require('assert');
let chalk = require('chalk');

function Reporter () {
  this.hasAnyOutput = false;
  this.level = 'warning';
}

Reporter.prototype.levelAsNumber = function (level) {
  return {
    error: 1,
    warning: 2,
    info: 3
  }[level] || 0;
};

Reporter.prototype.pickChalk = function (level) {
  return {
    error: chalk.red.bgWhite,
    warning: chalk.magenta,
    info: chalk.green
  }[level] || chalk.magenta;
};

Reporter.prototype.isCorrectLevel = function (level) {
  return this.levelAsNumber(level) > 0;
};

Reporter.prototype.isVisible = function (level) {
  return this.levelAsNumber(level) <=
         this.levelAsNumber(this.level);
};

Reporter.prototype.output = function (line) {
  if (typeof line === 'undefined') line = '';
  console.log(line); // TODO console.error once supports-color works for stderr?
};

Reporter.prototype.report = function (file, level, lines, error) {
  assert(this.isCorrectLevel(level));
  if (!this.isVisible(level)) return;
  this.output();
  if (file) this.output(chalk.cyan(file));
  if (!Array.isArray(lines)) lines = [ lines ];
  lines.some(function (line, index) {
    if (index === 0) {
      this.output('  ' + this.pickChalk(level)(level) + '  ' + line);
    } else {
      this.output('  ' + line);
    }
  }.bind(this));
  if (error) error.wasReported = true;
  this.hasAnyOutput = true;
};

Reporter.prototype.finish = function () {
  if (this.hasAnyOutput) {
    this.output();
  }
};

let reporter = new Reporter();
module.exports = reporter;
