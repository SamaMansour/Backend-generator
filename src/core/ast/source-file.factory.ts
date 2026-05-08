import {
  Project,
  SourceFile,
} from 'ts-morph';

export class SourceFileFactory {
  static create(
    project: Project,
    filePath: string,
  ): SourceFile {
    return project.createSourceFile(
      filePath,
      '',
      {
        overwrite: true,
      },
    );
  }
}