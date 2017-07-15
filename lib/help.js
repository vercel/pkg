import chalk from 'chalk';

export default function help () {
  console.log(`
  ${chalk.bold('pkg')} [options] <input>

  ${chalk.dim('Options:')}

    -h, --help       output usage information
    -v, --version    output pkg version
    -t, --targets    comma-separated list of targets (see examples)
    -c, --config     package.json or any json file with top-level config
    --options        bake v8 options into executable to run with them on
    -o, --output     output file name or template for several files
    --out-path       path to save output one or more executables
    -d, --debug      show more information during packaging process [off]
    -b, --build      don't download prebuilt base binaries, build them
    --public         speed up and disclose the sources of top-level project

  ${chalk.dim('Examples:')}

  ${chalk.gray('–')} Makes executables for Linux, macOS and Windows
    ${chalk.cyan('$ pkg index.js')}
  ${chalk.gray('–')} Takes package.json from cwd and follows 'bin' entry
    ${chalk.cyan('$ pkg .')}
  ${chalk.gray('–')} Makes executable for particular target machine
    ${chalk.cyan('$ pkg -t node6-alpine-x64 index.js')}
  ${chalk.gray('–')} Makes executables for target machines of your choice
    ${chalk.cyan('$ pkg -t node4-linux,node6-linux,node6-win index.js')}
  ${chalk.gray('–')} Bakes '--expose-gc' into executable
    ${chalk.cyan('$ pkg --options expose-gc index.js')}

`);
}
