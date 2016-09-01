import chalk from 'chalk';

export default function help () {

  console.log(`
  ${chalk.bold('pkg')} [options] <input>

  ${chalk.dim('Options:')}

    -h, --help       output usage information
    -t, --targets    comma-separated list of targets (see examples)
    -d, --debug      debug mode [off]
    -c, --config     package.json or any json file with top-level config
    -o, --output     output file name or template for several files
    -b, --build      don't download prebuilt base binaries, build them

  ${chalk.dim('Examples:')}

  ${chalk.gray('–')} Makes executable for particular target machine

    ${chalk.cyan('$ pkg -t v6-linux-x64 index.js')}

`);

}
