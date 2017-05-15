import { chmod, stat } from 'fs-extra';

export async function plusx (file) {
  const s = await stat(file);
  const newMode = s.mode | 64 | 8 | 1;
  if (s.mode === newMode) return;
  const base8 = newMode.toString(8).slice(-3);
  await chmod(file, base8);
}
