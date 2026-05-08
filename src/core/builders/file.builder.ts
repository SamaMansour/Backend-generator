import {
  GeneratedFile,
} from '../generators/project-definition.interface';

export class FileBuilder {
  static create(
    path: string,
    content: string,
  ): GeneratedFile {
    return {
      path,
      content,
    };
  }
}