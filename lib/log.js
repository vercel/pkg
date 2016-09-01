import Progress from 'progress';
import assert from 'assert';
import chalk from 'chalk';

class Log {
  _lines (lines) {
    if (!Array.isArray(lines)) {
      console.log(`  ${lines}`);
      return;
    }
    for (const line of lines) {
      console.log(`  ${line}`);
    }
  }

  debug (text, lines) {
    if (!this.debugMode) return;
    console.log(`> ${chalk.green('[debug]')} ${text}`);
    if (lines) this._lines(lines);
  }

  info (text, lines) {
    console.log(`> ${text}`);
    if (lines) this._lines(lines);
  }

  warn (text, lines) {
    console.log(`> ${chalk.blue('Warning')} ${text}`);
    if (lines) this._lines(lines);
  }

  error (text, lines) {
    if (text.stack) text = text.stack;
    console.log(`> ${chalk.red('Error!')} ${text}`);
    if (lines) this._lines(lines);
  }

  enableProgress (text) {
    assert(!this.bar);
    this.bar = new Progress(`  ${text} [:bar] :percent`, {
      width: 20,
      complete: '=',
      incomplete: ' ',
      total: 100
    });
  }

  showProgress (percentage) {
    this.bar.update(percentage / 100);
  }

  disableProgress () {
    assert(this.bar);
    // it is auto-completed once it updates to 100
    // otherwise it outputs a blank line
    if (!this.bar.complete) {
      this.bar.terminate();
    }
    delete this.bar;
  }
}

export const log = new Log();

export function wasReported (error, lines) {
  if (error === undefined) {
    error = new Error('No message');
  } else
  if (typeof error === 'string') {
    log.error(error, lines);
    error = new Error(error);
  }
  error.wasReported = true;
  return error;
}
