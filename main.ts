// HomeBudget — entrypoint for the make.fun hand-in.
//
// Copies the site (app/) and its screenshots (screenshots/) from this
// repository into the output directory, then writes /output/dossier.json
// with buildDossier from vendor/makefun-frontend.ts, exactly as the
// competition's gate rebuilds it. Standard library only; runs on Node 22.

import { cpSync, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

// The gate's caps for this competition: text 160 KiB, at most 4 screenshots
// of at most 256 KiB each, app/ at most 993 files and 16 MiB in all.
const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16 * 1024 * 1024,
  app_path_max_bytes: 1000
};

for (const name of ['app', 'screenshots', 'dossier.json']) {
  rmSync(join(outDir, name), { recursive: true, force: true });
}
// NOTE: never rmSync(outDir) itself. In the grader /output is a mount
// point whose parent the program cannot write, so removing the directory
// itself fails (EACCES/EBUSY, exit 1). Emptying its contents is enough:
// the copies below recreate app/ and screenshots/ fresh.
mkdirSync(outDir, { recursive: true });

for (const name of ['app', 'screenshots']) {
  const src = join(repoRoot, name);
  if (!existsSync(src)) throw new Error(`main.ts: missing ${name}/ in the repository`);
  cpSync(src, join(outDir, name), { recursive: true });
}

writeFileSync(join(outDir, 'dossier.json'), buildDossier(outDir, caps));
const dossierBytes = statSync(join(outDir, 'dossier.json')).size;
console.log(`wrote ${outDir}/dossier.json (${dossierBytes} bytes)`);
