import {resolve, join, isAbsolute, dirname, relative} from 'path';
import {readFile, writeFile, mkdirp, pathExists} from 'fs-extra';

export interface FileResult {
  path: string;
  overwritten: boolean;
}

// This file manages most of the annoyance of dealing with the file system,
// and also optimizes for building files up more iteratively by managing
// an in-memory cache of files. It also does path normalization from the
// root directory, which can be quite annoying to remember to do everywhere
// else.

export default class FileSystem {
  root: string;
  files = new Map<string, string>();
  private readCache = new Map<string, string>();

  // If we wanted to, we could easily add options here that would allow us to present
  // custom UI. For example, to be able to ask whether we want to overwrite a file.
  constructor(root: string) {
    this.root = resolve(root);
  }

  join(...segments: string[]) {
    return join(...segments);
  }

  async read(path: string) {
    const fullPath = this.fullPath(path);

    if (this.files.has(fullPath)) {
      return this.files.get(fullPath)!;
    }

    if (this.readCache.has(fullPath)) {
      return this.readCache.get(fullPath)!;
    }

    const contents = await readFile(fullPath, 'utf8');
    this.readCache.set(fullPath, contents);

    return contents;
  }

  async exists(path: string) {
    return await pathExists(this.fullPath(path));
  }

  // Here was the "oh wait, this feels like a good chance for some newer tech!" moment.
  // I needed a way to actually write the in-memory cache to disc, then get the results
  // of that and print them in the UI. At first, I just did it all and printed each element
  // in the array. But I could get more real-time feedback (not super noticeable in small files,
  // but worth having anyways) by yielding every result as I write it.
  async * commit(): AsyncIterableIterator<FileResult> {
    for (const [path, contents] of this.files.entries()) {
      const exists = await this.exists(path);

      if (!exists) {
        // Annoying to remember to do if you manage the file system manually.
        await mkdirp(dirname(path));
      }

      await writeFile(path, formatFile(contents));
      yield {path: this.relativePath(path), overwritten: exists};
    }
  }

  // The main in-memory part here
  write(path: string, contents: string) {
    this.files.set(this.fullPath(path), contents);
  }

  fullPath(path: string) {
    return isAbsolute(path) ? path : this.join(this.root, path);
  }

  relativePath(path: string) {
    return isAbsolute(path) ? relative(this.root, path) : path;
  }
}

// This is nice since it's one place to have all the formatting live. I don't love
// that it lives with the file system, since it's not a directly related concern;
// it might be better as something injected in via an option to the class. But,
// this way, none of the generators need to care about their formatting.
function formatFile(file: string) {
  const match = file.match(/^[^\S\n]*(?=\S)/gm);
  const indent = match && Math.min(...match.map(el => el.length));

  if (indent) {
    const regexp = new RegExp(`^.{${indent}}`, 'gm');
    return file.replace(regexp, '').trim() + '\n';
  }

  return file.trim() + '\n';
}
