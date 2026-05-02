'use strict';

const { onionModuleFiles } = require('../templates/onion.templates');
const { appModuleTemplate, mainTemplate, databaseConfigTemplate } = require('../templates/common.templates');

function generateOnion({ projectName, modules, includeSwagger }) {
  const files = {};

  files['src/main.ts'] = mainTemplate(projectName, includeSwagger);
  files['src/app.module.ts'] = appModuleTemplate(modules, 'onion');
  files['src/config/database.config.ts'] = databaseConfigTemplate();

  for (const mod of modules) {
    const moduleFiles = onionModuleFiles(mod);
    for (const [filePath, content] of Object.entries(moduleFiles)) {
      files[filePath] = content;
    }
  }

  return {
    files,
    patternName: 'Onion Architecture',
    description: onionDescription(),
  };
}

function onionDescription() {
  return `## Onion Architecture Folder Structure

Concentric layers — each layer can only depend on inner layers.

\`\`\`
src/
  <module>/
    domain/                          # Innermost — pure domain
      models/
        <module>.model.ts            # Domain model (no ORM)
      value-objects/
      interfaces/
        i-<module>-repository.ts     # Repository abstraction
    application/                     # Application layer
      services/
        <module>.application-service.ts
      dtos/
        create-<module>.dto.ts
        update-<module>.dto.ts
        <module>-response.dto.ts
      interfaces/
        i-<module>-service.ts
    infrastructure/                  # Outermost — frameworks & drivers
      persistence/
        typeorm/
          <module>.orm-entity.ts
          <module>.repository.impl.ts
          <module>.repository.mapper.ts
      http/
        <module>.controller.ts
    <module>.module.ts
\`\`\`

### Key Principles
- Dependencies always point **inward**
- Domain has no knowledge of infrastructure
- Application layer orchestrates domain objects via interfaces
- Infrastructure provides concrete implementations injected at runtime
`;
}

module.exports = { generateOnion };
