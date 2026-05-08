import {
  Scope,
  SourceFile,
} from 'ts-morph';

export class EntityBuilder {
  static build(
    sourceFile: SourceFile,
    entityName: string,
  ): void {
    sourceFile.addClass({
      name: entityName,
      isExported: true,
      ctors: [
        {
          scope: Scope.Public,
          parameters: [
            {
              name: 'id',
              type: 'string',
              isReadonly: true,
              scope: Scope.Public,
            },
            {
              name: 'name',
              type: 'string',
              scope: Scope.Public,
            },
          ],
        },
      ],
      methods: [
        {
          name: 'update',
          parameters: [
            {
              name: 'name',
              type: 'string',
            },
          ],
          returnType: 'void',
          statements: ['this.name = name;'],
        },
      ],
    });
  }
}