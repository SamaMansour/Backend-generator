'use strict';

const { dddModuleFiles } = require('../templates/ddd.templates');
const { appModuleTemplate, mainTemplate, databaseConfigTemplate } = require('../templates/common.templates');

function generateDDD({ projectName, modules, includeSwagger }) {
  const files = {};

  // Core app files
  files['src/main.ts'] = mainTemplate(projectName, includeSwagger);
  files['src/app.module.ts'] = appModuleTemplate(modules, 'ddd');
  files['src/config/database.config.ts'] = databaseConfigTemplate();

  // Each module gets full DDD structure
  for (const mod of modules) {
    const moduleFiles = dddModuleFiles(mod);
    for (const [filePath, content] of Object.entries(moduleFiles)) {
      files[filePath] = content;
    }
  }

  return {
    files,
    patternName: 'Domain-Driven Design (DDD)',
    description: dddDescription(),
  };
}

function dddDescription() {
  return `## DDD Folder Structure

Each module follows a strict DDD layering:

\`\`\`
src/
  <module>/
    domain/
      entities/          # Domain entities (rich business objects)
      value-objects/     # Immutable value objects
      repositories/      # Repository interfaces (abstractions)
      services/          # Domain services (pure business logic)
      events/            # Domain events
    application/
      use-cases/         # Application use cases (one class per use case)
      dtos/              # Data Transfer Objects
      mappers/           # Domain <-> DTO mappers
    infrastructure/
      persistence/
        typeorm/
          entities/      # ORM entities
          repositories/  # Concrete repository implementations
      http/
        controllers/     # NestJS controllers
    <module>.module.ts
\`\`\`

### Key Principles
- Domain layer has **zero** framework dependencies
- Use cases orchestrate domain objects
- Infrastructure adapts external concerns (DB, HTTP) to the domain
`;
}

module.exports = { generateDDD };
