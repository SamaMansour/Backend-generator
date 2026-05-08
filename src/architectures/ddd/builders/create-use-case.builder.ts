import { SourceFile, Scope } from "ts-morph";

export class CreateUseCaseBuilder {
  static build(
    sourceFile: SourceFile,
    moduleName: string,
  ): void {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@nestjs/common',
      namedImports: ['Injectable'],
    });

    sourceFile.addClass({
      name: `Create${moduleName}UseCase`,
      isExported: true,
      decorators: [
        {
          name: 'Injectable',
          arguments: [],
        },
      ],
      methods: [
        {
          name: 'execute',
          scope: Scope.Public,
          isAsync: true,
          returnType: 'Promise<void>',
          statements: ['return;'],
        },
      ],
    });
  }
}