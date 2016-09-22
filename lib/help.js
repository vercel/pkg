import chalk from 'chalk';

export default function help () {

  console.log(`
  ${chalk.bold('pkg')} [options] <input>

  ${chalk.dim('Options:')}

    -h, --help       output usage information
    -t, --targets    comma-separated list of targets (see examples)
    -o, --output     output file name or template for several files
    --out-dir        path to save output one or more executables
    -d, --debug      show more information about packaging process [off]
    -c, --config     package.json or any json file with top-level config
    --options        bake v8 options into executable to run with them on
    -b, --build      don't download prebuilt base binaries, build them

  ${chalk.dim('Examples:')}

  ${chalk.gray('–')} Makes executables for Linux, macOS and Windows
    ${chalk.cyan('$ pkg index.js')}
  ${chalk.gray('–')} Takes package.json from cwd and follows 'bin' entry
    ${chalk.cyan('$ pkg .')}
  ${chalk.gray('–')} Makes executable for particular target machine
    ${chalk.cyan('$ pkg -t node6-linux-x64 index.js')}
  ${chalk.gray('–')} Makes executables for your choice target machines
    ${chalk.cyan('$ pkg -t node4-linux,node6-linux,node6-win index.js')}

`);

}
