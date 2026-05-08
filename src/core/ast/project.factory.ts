import { Project, IndentationText, QuoteKind } from 'ts-morph';

export class ProjectFactory {
  static create(): Project {
    return new Project({
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces,
        quoteKind: QuoteKind.Single,
        useTrailingCommas: true,
      },
      compilerOptions: {
        target: 99,
      },
    });
  }
}