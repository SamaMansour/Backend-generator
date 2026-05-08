export interface GeneratedFile {
  path: string;
  content: string;
}

export interface ProjectDefinition {
  files: GeneratedFile[];
  patternName: string;
  description: string;
}