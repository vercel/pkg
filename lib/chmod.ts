import { promises as fs } from 'fs';

export async function plusx(file: string) {
  const s = await fs.stat(file);
  const newMode = s.mode | 64 | 8 | 1;

  if (s.mode === newMode) {
    return;
  }

  const base8 = newMode.toString(8).slice(-3);
  await fs.chmod(file, base8);
}
