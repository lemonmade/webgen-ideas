import {Env} from '../types';
import { normalizeComponentName } from "../utilities";

// Now that most of the complexity of the environment is hidden away, the generator is
// super dumb and easy to follow. We could easily split it up into separate functions as it gets
// large, since the whole thing is basically just a series of function calls.
export default async function componentGenerator({fs, app, ui}: Env) {
  const name = normalizeComponentName(
    await ui.ask("What is the component’s name?")
  );

  const graphql = app.usesGraphQL && await ui.ask("Does the component need a GraphQL query?", {
    boolean: true
  });

  const css = await ui.ask("Does the component need a its own CSS?", {
    boolean: true
  });

  const {componentDirectories} = app;
  const containingComponentDirectory =
    componentDirectories.length === 1
      ? componentDirectories[0]
      : await ui.ask("Where do you want to generate the component?", {
          choices: componentDirectories
        });

  const path = fs.join(containingComponentDirectory, name);

  if (css) {
    fs.write(fs.join(path, `${name}.scss`), `
      .${name} {}
    `);
  }

  if (graphql) {
    fs.write(fs.join(path, `graphql/${name}Query.graphql`), `
      query ${name} {}
    `);
  }

  fs.write(fs.join(path, 'index.ts'), `
    export {default, Props} from './${name}';
  `);

  // TODO: build some utilities to generate the AST and add styles/ graphql accordingly
  fs.write(fs.join(path, `${name}.tsx`), `
    import * as React from 'react';

    export interface Props {}

    export default class ${name} extends React.Component<Props> {
      render() {
        return <div>${name}</div>;
      }
    }
  `);

  fs.write(fs.join(containingComponentDirectory, 'index.ts'), `
    export {default as ${name}, Props as ${name}Props} from './${name}';
  `);
}
