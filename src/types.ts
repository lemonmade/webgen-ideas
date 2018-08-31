import App from "./app";
import FileSystem from "./fs";
import {Ui} from "./ui";

export interface Env {
  fs: FileSystem;
  ui: Ui;
  app: App;
}
