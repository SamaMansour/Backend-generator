import prettier from 'prettier';

export class PrettierService {
  static async format(code: string): Promise<string> {
    return prettier.format(code, {
      parser: 'typescript',
      singleQuote: true,
      trailingComma: 'all',
    });
  }
}