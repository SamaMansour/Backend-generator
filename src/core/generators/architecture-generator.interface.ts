import {
  GeneratorConfig,
} from '../types/generator.types';

import {
  ProjectDefinition,
} from './project-definition.interface';

export interface ArchitectureGenerator {
  generate(
    config: GeneratorConfig,
  ): Promise<ProjectDefinition>;
}