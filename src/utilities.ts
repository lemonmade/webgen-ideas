import {pascalCase} from 'change-case';

export function normalizeComponentName(name: string) {
  return pascalCase(name);
}
