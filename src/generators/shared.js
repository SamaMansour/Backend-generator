'use strict';

const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

function writeSharedFiles(projectName, structure, opts) {
  const root = path.resolve(process.cwd(), projectName);

  // Write all files from the structure map
  for (const [filePath, content] of Object.entries(structure.files)) {
    writeFile(path.join(root, filePath), content);
  }

  // package.json
  writeFile(path.join(root, 'package.json'), generatePackageJson(projectName, opts.includeSwagger));

  // tsconfig
  writeFile(path.join(root, 'tsconfig.json'), generateTsConfig());
  writeFile(path.join(root, 'tsconfig.build.json'), generateTsConfigBuild());

  // .eslintrc
  writeFile(path.join(root, '.eslintrc.js'), generateEslint());

  // .prettierrc
  writeFile(path.join(root, '.prettierrc'), JSON.stringify({ singleQuote: true, trailingComma: 'all' }, null, 2));

  // .env
  writeFile(path.join(root, '.env'), generateEnv());
  writeFile(path.join(root, '.env.example'), generateEnv());

  // .gitignore
  writeFile(path.join(root, '.gitignore'), generateGitIgnore());

  // nest-cli.json
  writeFile(path.join(root, 'nest-cli.json'), JSON.stringify({ "$schema": "https://json.schemastore.org/nest-cli", "collection": "@nestjs/schematics", "sourceRoot": "src", "compilerOptions": { "deleteOutDir": true } }, null, 2));

  if (opts.includeDocker) {
    writeFile(path.join(root, 'Dockerfile'), generateDockerfile());
    writeFile(path.join(root, 'docker-compose.yml'), generateDockerCompose(projectName));
    writeFile(path.join(root, '.dockerignore'), generateDockerIgnore());
  }

  // README
  writeFile(path.join(root, 'README.md'), generateReadme(projectName, structure.patternName, structure.description));
}

function generatePackageJson(projectName, includeSwagger) {
  const deps = {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "typeorm": "^0.3.17",
    "pg": "^8.11.3",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
  };

  if (includeSwagger) {
    deps["@nestjs/swagger"] = "^7.1.0";
    deps["swagger-ui-express"] = "^5.0.0";
  }

  return JSON.stringify({
    name: projectName,
    version: "0.0.1",
    description: "",
    private: true,
    scripts: {
      "build": "nest build",
      "format": "prettier --write \"src/**/*.ts\"",
      "start": "nest start",
      "start:dev": "nest start --watch",
      "start:debug": "nest start --debug --watch",
      "start:prod": "node dist/main",
      "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
      "test": "jest",
      "test:watch": "jest --watch",
      "test:cov": "jest --coverage",
      "test:e2e": "jest --config ./test/jest-e2e.json"
    },
    dependencies: deps,
    devDependencies: {
      "@nestjs/cli": "^10.0.0",
      "@nestjs/schematics": "^10.0.0",
      "@nestjs/testing": "^10.0.0",
      "@types/express": "^4.17.17",
      "@types/jest": "^29.5.2",
      "@types/node": "^20.3.1",
      "@typescript-eslint/eslint-plugin": "^6.0.0",
      "@typescript-eslint/parser": "^6.0.0",
      "eslint": "^8.42.0",
      "eslint-config-prettier": "^9.0.0",
      "eslint-plugin-prettier": "^5.0.0",
      "jest": "^29.5.0",
      "prettier": "^3.0.0",
      "source-map-support": "^0.5.21",
      "ts-jest": "^29.1.0",
      "ts-loader": "^9.4.3",
      "ts-node": "^10.9.1",
      "tsconfig-paths": "^4.2.0",
      "typescript": "^5.1.3"
    },
    jest: {
      moduleFileExtensions: ["js", "json", "ts"],
      rootDir: "src",
      testRegex: ".*\\.spec\\.ts$",
      transform: { "^.+\\.(t|j)s$": "ts-jest" },
      collectCoverageFrom: ["**/*.(t|j)s"],
      coverageDirectory: "../coverage",
      testEnvironment: "node"
    }
  }, null, 2);
}

function generateTsConfig() {
  return JSON.stringify({
    compilerOptions: {
      module: "commonjs",
      declaration: true,
      removeComments: true,
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      allowSyntheticDefaultImports: true,
      target: "ES2021",
      sourceMap: true,
      outDir: "./dist",
      baseUrl: "./",
      incremental: true,
      skipLibCheck: true,
      strictNullChecks: false,
      noImplicitAny: false,
      strictBindCallApply: false,
      forceConsistentCasingInFileNames: false,
      noFallthroughCasesInSwitch: false,
      paths: {
        "@/*": ["src/*"]
      }
    }
  }, null, 2);
}

function generateTsConfigBuild() {
  return JSON.stringify({
    extends: "./tsconfig.json",
    exclude: ["node_modules", "test", "dist", "**/*spec.ts"]
  }, null, 2);
}

function generateEslint() {
  return `module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
`;
}

function generateEnv() {
  return `NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=app_db
`;
}

function generateGitIgnore() {
  return `# dependencies
node_modules/
dist/
build/

# env
.env
.env.local
.env.*.local

# logs
*.log
npm-debug.log*

# IDE
.vscode/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# coverage
coverage/
`;
}

function generateDockerfile() {
  return `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
`;
}

function generateDockerCompose(projectName) {
  return `version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=postgres
      - DB_DATABASE=${projectName}_db
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ${projectName}_db
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;
}

function generateDockerIgnore() {
  return `node_modules
dist
.env
.git
*.log
`;
}

function generateReadme(projectName, patternName, description) {
  return `# ${projectName}

A NestJS project structured with **${patternName}**.

## Architecture

${description}

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Development
npm run start:dev

# Production build
npm run build
npm run start:prod
\`\`\`

## Environment Variables

Copy \`.env.example\` to \`.env\` and adjust values:

\`\`\`
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=app_db
\`\`\`

## Docker

\`\`\`bash
docker-compose up --build
\`\`\`
`;
}

module.exports = { writeSharedFiles, writeFile, ensureDir };
