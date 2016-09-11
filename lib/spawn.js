import chipo from 'child_process';

export default function spawn (cmd, args, opts) {
  return new Promise((resolve, reject) => {
    const child = chipo.spawn(cmd, args, opts);
    let stdout = new Buffer(0);
    if (child.stdout) {
      child.stdout.on('data', (data) => {
        stdout = Buffer.concat([ stdout, data ]);
      });
    }
    child.on('error', (error) => {
      reject(error);
    });
    child.on('close', (code) => {
      if (code) {
        return reject(new Error(`${cmd} failed with code ${code}`));
      }
      resolve(stdout);
    });
  });
}
