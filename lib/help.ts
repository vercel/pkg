import chalk from 'chalk';

export default function help() {
  // eslint-disable-next-line no-console
  console.log(`
  ${chalk.bold('pkg')} [options] <input>

  ${chalk.dim('Options:')}

    -h, --help           output usage information
    -v, --version        output pkg version
    -t, --targets        comma-separated list of targets (see examples)
    -c, --config         package.json or any json file with top-level config
    --options            bake v8 options into executable to run with them on
    -o, --output         output file name or template for several files
    --out-path           path to save output one or more executables
    -d, --debug          show more information during packaging process [off]
    -b, --build          don't download prebuilt base binaries, build them
    --public             speed up and disclose the sources of top-level project
    --public-packages    force specified packages to be considered public
    --no-bytecode        skip bytecode generation and include source files as plain js
    --no-native-build    skip native addons build
    --no-dict            comma-separated list of packages names to ignore dictionaries. Use --no-dict * to disable all dictionaries
    -C, --compress       [default=None] compression algorithm = Brotli or GZip

  ${chalk.dim('Examples:')}

  ${chalk.gray('–')} Makes executables for Linux, macOS and Windows
    ${chalk.cyan('$ pkg index.js')}
  ${chalk.gray('–')} Takes package.json from cwd and follows 'bin' entry
    ${chalk.cyan('$ pkg .')}
  ${chalk.gray('–')} Makes executable for particular target machine
    ${chalk.cyan('$ pkg -t node14-win-arm64 index.js')}
  ${chalk.gray('–')} Makes executables for target machines of your choice
    ${chalk.cyan('$ pkg -t node16-linux,node18-linux,node18-win index.js')}
  ${chalk.gray(
    '–'
  )} Bakes '--expose-gc' and '--max-heap-size=34' into executable
    ${chalk.cyan('$ pkg --options "expose-gc,max-heap-size=34" index.js')}
  ${chalk.gray('–')} Consider packageA and packageB to be public
    ${chalk.cyan('$ pkg --public-packages "packageA,packageB" index.js')}
  ${chalk.gray('–')} Consider all packages to be public
    ${chalk.cyan('$ pkg --public-packages "*" index.js')}
  ${chalk.gray('–')} Bakes '--expose-gc' into executable
    ${chalk.cyan('$ pkg --options expose-gc index.js')}
  ${chalk.gray(
    '–'
  )} reduce size of the data packed inside the executable with GZip
    ${chalk.cyan('$ pkg --compress GZip index.js')}
`);
}
