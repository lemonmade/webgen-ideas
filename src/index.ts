import FileSystem from "./fs";
import App from "./app";
import {Cli} from './ui';
import componentGenerator from './generators/component';

(async () => {
  const root = process.cwd() + "/example";

  // From my estimation, there are four things our CLI will do:
  //
  // 1. Present a UI
  // 2. Read and write to the file system
  // 3. Get details about, and potentially update, features of the app
  // 4. Creates the contents of the files to be generated
  //
  // For each of the first 3, I created an abstraction, which is injected
  // into 4 so that it can get and set the details it needs to set the
  // contents of the files. This file is the starting point; it simply
  // creates the "environment" that the generator will operate in,
  // and coordinates the "flushing" after the generator has done its work.
  const fs = new FileSystem(root);
  const app = new App(root);
  const ui = new Cli();

  await componentGenerator({fs, ui, app});

  for await (const file of fs.commit()) {
    ui.printFile(file);
  }

  await app.commit();
})();
