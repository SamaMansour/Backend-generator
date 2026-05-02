'use strict';

const { hexModuleFiles } = require('../templates/hexagonal.templates');
const { appModuleTemplate, mainTemplate, databaseConfigTemplate } = require('../templates/common.templates');

function generateHexagonal({ projectName, modules, includeSwagger }) {
  const files = {};

  files['src/main.ts'] = mainTemplate(projectName, includeSwagger);
  files['src/app.module.ts'] = appModuleTemplate(modules, 'hexagonal');
  files['src/config/database.config.ts'] = databaseConfigTemplate();

  for (const mod of modules) {
    const moduleFiles = hexModuleFiles(mod);
    for (const [filePath, content] of Object.entries(moduleFiles)) {
      files[filePath] = content;
    }
  }

  return {
    files,
    patternName: 'Hexagonal Architecture (Ports & Adapters)',
    description: hexDescription(),
  };
}

function hexDescription() {
  return `## Hexagonal Architecture Folder Structure

The application core defines **Ports** (interfaces). **Adapters** implement them.

\`\`\`
src/
  <module>/
    core/
      domain/
        <module>.entity.ts          # Core domain model
        <module>.value-objects.ts   # Value objects
      ports/
        in/                         # Driving ports (use case interfaces)
          create-<module>.port.ts
          find-<module>.port.ts
          update-<module>.port.ts
          delete-<module>.port.ts
        out/                        # Driven ports (repository interfaces)
          <module>-repository.port.ts
      services/
        <module>.service.ts         # Application service implementing in-ports
    adapters/
      in/
        http/                       # Primary adapter: REST controllers
          <module>.controller.ts
          dtos/
      out/
        persistence/                # Secondary adapter: DB repositories
          typeorm/
            <module>.typeorm-entity.ts
            <module>.typeorm-repository.ts
    <module>.module.ts
\`\`\`

### Key Principles
- The core **never depends** on adapters
- Ports are plain TypeScript interfaces
- You can swap any adapter (HTTP -> gRPC, TypeORM -> Mongoose) without touching core logic
`;
}

module.exports = { generateHexagonal };
