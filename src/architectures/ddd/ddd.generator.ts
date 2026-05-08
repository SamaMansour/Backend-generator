import path from 'path';

import {
  ArchitectureGenerator,
} from '../../core/generators/architecture-generator.interface';

import {
  GeneratorConfig,
} from '../../core/types/generator.types';

import {
  ProjectDefinition,
} from '../../core/generators/project-definition.interface';

import {
  ProjectFactory,
} from '../../core/ast/project.factory';

import {
  SourceFileFactory,
} from '../../core/ast/source-file.factory';

import {
  EntityBuilder,
} from './builders/entity.builder';

import {
  CreateUseCaseBuilder,
} from './builders/create-use-case.builder';



export class DddGenerator implements ArchitectureGenerator {
  async generate(
    config: GeneratorConfig,
  ): Promise<ProjectDefinition> {
    const project = ProjectFactory.create();

    for (const module of config.modules) {
      const entityFile = SourceFileFactory.create(
        project,
        `src/${module}/domain/entities/${module}.entity.ts`,
      );

      EntityBuilder.build(
        entityFile,
        `${module}Entity`,
      );

      const useCaseFile = SourceFileFactory.create(
        project,
        `src/${module}/application/use-cases/create-${module}.use-case.ts`,
      );

      CreateUseCaseBuilder.build(
        useCaseFile,
        module,
      );
    }

    await project.save();

    return {
      files: [],
      patternName: 'DDD',
      description: 'DDD architecture',
    };
  }
}