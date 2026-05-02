'use strict';

const { pascal, camel } = require('../utils/string');

function mainTemplate(projectName, includeSwagger) {
  const swaggerImport = includeSwagger
    ? `import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';`
    : '';

  const swaggerSetup = includeSwagger
    ? `
  const config = new DocumentBuilder()
    .setTitle('${pascal(projectName)} API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
`
    : '';

  return `import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
${swaggerImport}
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();
${swaggerSetup}
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(\`Application running on: http://localhost:\${port}/api\`);
}

bootstrap();
`;
}

function appModuleTemplate(modules, pattern) {
  const imports = modules.map((m) => `import { ${pascal(m)}Module } from './${m}/${m}.module';`).join('\n');
  const moduleList = modules.map((m) => `${pascal(m)}Module`).join(',\n    ');

  return `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
${imports}
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: databaseConfig }),
    ${moduleList},
  ],
})
export class AppModule {}
`;
}

function databaseConfigTemplate() {
  return `import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'app_db',
  entities: [__dirname + '/../**/*.{entity,orm-entity,typeorm-entity}.{ts,js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});
`;
}

module.exports = { mainTemplate, appModuleTemplate, databaseConfigTemplate };
