import inquirer from 'inquirer';
import {FileResult} from './fs';

interface ChoiceQuestion {
  choices: string[];
}

interface BooleanQuestion {
  boolean: true;
}

type CombinedOptions = Partial<ChoiceQuestion> & Partial<BooleanQuestion>;

// I chose not to just use raw inquirer for a few reasons. For one, there
// were several different UI-related tasks I knew we needed, not just asking
// questions. I also wanted to expose a more specific API that would be easier
// to consume in the generator, so that it detracted less attention from the
// generating parts (and also, to make it more strongly typed).
//
// I chose to do this as an interface + object combo because it makes it easier to
// potentially sub out a different UI (i.e., a VSCode extension or similar) in the future,
// without needing the generator to change at all. This doesn't quite do that well, as
// it is optimized for asking questions serially, one after another; this is good for
// CLIs but probably not quite right for other UIs. So, not perfect, but at least we
// don't expose so many of the implementation details to the user, and we have one
// place for managing the look and feel of the UI.

export interface Ui {
  ask(
    message: string,
    options: ChoiceQuestion
  ): Promise<string>;
  ask(
    message: string,
    options: BooleanQuestion
  ): Promise<boolean>;
  ask(message: string): Promise<string>;

  printFile(file: FileResult): void;
}

export class Cli implements Ui {
  async ask(
    message: string,
    options: ChoiceQuestion
  ): Promise<string>;
  async ask(
    message: string,
    options: BooleanQuestion
  ): Promise<boolean>;
  async ask(message: string): Promise<string>;
  async ask(
    message: string,
    options: CombinedOptions = {}
  ): Promise<string | boolean> {
    const normalizedQuestion: any = {
      message,
      name: "question"
    };
  
    if (options.choices) {
      normalizedQuestion.type = "list";
      normalizedQuestion.choices = options.choices;
    }
  
    if (options.boolean) {
      normalizedQuestion.type = "confirm";
    }
  
    const { question: result } = await inquirer.prompt<{ question: any }>(
      normalizedQuestion
    );
    return result;
  }

  printFile({path, overwritten}: FileResult) {
    console.log(`wrote: ${path}${overwritten ? ' (overwrote another file)' : ''}`);
  }
}
