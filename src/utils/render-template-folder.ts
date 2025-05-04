import * as fs from 'fs-extra';
import * as path from 'path';
import * as mustache from 'mustache';
import { glob } from 'glob';

export async function renderTemplateFolder(
  sourceDir: string,
  destDir: string,
  context: Record<string, any>,
) {
  const files = await glob(`${sourceDir}/**/*`, { nodir: true });

  for (const file of files) {
    const relPath = path.relative(sourceDir, file);
    const raw = await fs.readFile(file, 'utf-8');
    const rendered = mustache.render(raw, context);
    const outPath = path.join(destDir, relPath.replace(/\.mustache$/, ''));

    await fs.ensureDir(path.dirname(outPath));
    await fs.writeFile(outPath, rendered);
  }
}
