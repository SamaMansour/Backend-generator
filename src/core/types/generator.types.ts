export type ArchitecturePattern =
  | 'ddd'
  | 'hexagonal'
  | 'onion';

export interface GeneratorConfig {
  projectName: string;
  pattern: ArchitecturePattern;
  modules: string[];
  includeDocker: boolean;
  includeSwagger: boolean;
}