import Progress from 'progress';
import assert from 'assert';
import chalk from 'chalk';

class Log {
  info (text) {
    console.log(`> ${text}`);
  }

  warn (text) {
    console.log(`> ${chalk.blue('WARN')} ${text}`);
  }

  error (text) {
    if (text.message) text = text.message;
    console.log(`> ${chalk.red('ERR!')} ${text}`);
  }

  enableProgress (text) {
    assert(!this.bar);
    this.bar = new Progress(`    ${text} [:bar] :percent`, {
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
    this.bar.update(1);
    this.bar.terminate();
    delete this.bar;
  }
}

export const log = new Log();
