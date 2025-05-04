import * as fs from 'fs-extra';
import * as archiver from 'archiver';

export async function zipDirectory(source: string): Promise<string> {
  const zipPath = `${source}.zip`;
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);
  archive.directory(source, false);
  await archive.finalize();

  return zipPath;
}
