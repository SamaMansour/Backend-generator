'use strict';

const { pascal, camel, kebab } = require('../utils/string');

function onionModuleFiles(mod) {
  const P = pascal(mod);
  const c = camel(mod);
  const k = kebab(mod);
  const files = {};

  // ── Domain Layer (innermost) ─────────────────────────────────────────────────

  files[`src/${k}/domain/models/${k}.model.ts`] = `export class ${P}Model {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(props: { id: string; name: string }): ${P}Model {
    return new ${P}Model(props.id, props.name, new Date(), new Date());
  }

  update(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }
}
`;

  files[`src/${k}/domain/value-objects/${k}-name.vo.ts`] = `export class ${P}Name {
  private constructor(private readonly value: string) {}

  static create(value: string): ${P}Name {
    if (!value || value.trim().length === 0) throw new Error('Name cannot be empty');
    if (value.length > 255) throw new Error('Name too long');
    return new ${P}Name(value.trim());
  }

  toString(): string { return this.value; }
}
`;

  files[`src/${k}/domain/interfaces/i-${k}-repository.ts`] = `import { ${P}Model } from '../models/${k}.model';

export const I_${P.toUpperCase()}_REPOSITORY = Symbol('I${P}Repository');

export interface I${P}Repository {
  findById(id: string): Promise<${P}Model | null>;
  findAll(): Promise<${P}Model[]>;
  save(model: ${P}Model): Promise<${P}Model>;
  update(model: ${P}Model): Promise<${P}Model>;
  delete(id: string): Promise<void>;
}
`;

  // ── Application Layer ─────────────────────────────────────────────────────────

  files[`src/${k}/application/dtos/create-${k}.dto.ts`] = `import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Create${P}Dto {
  @ApiProperty({ example: 'My ${P}' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}
`;

  files[`src/${k}/application/dtos/update-${k}.dto.ts`] = `import { PartialType } from '@nestjs/swagger';
import { Create${P}Dto } from './create-${k}.dto';

export class Update${P}Dto extends PartialType(Create${P}Dto) {}
`;

  files[`src/${k}/application/dtos/${k}-response.dto.ts`] = `import { ApiProperty } from '@nestjs/swagger';

export class ${P}ResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
`;

  files[`src/${k}/application/interfaces/i-${k}-service.ts`] = `import { Create${P}Dto } from '../dtos/create-${k}.dto';
import { Update${P}Dto } from '../dtos/update-${k}.dto';
import { ${P}ResponseDto } from '../dtos/${k}-response.dto';

export const I_${P.toUpperCase()}_SERVICE = Symbol('I${P}Service');

export interface I${P}Service {
  create(dto: Create${P}Dto): Promise<${P}ResponseDto>;
  findById(id: string): Promise<${P}ResponseDto>;
  findAll(): Promise<${P}ResponseDto[]>;
  update(id: string, dto: Update${P}Dto): Promise<${P}ResponseDto>;
  delete(id: string): Promise<void>;
}
`;

  files[`src/${k}/application/services/${k}.application-service.ts`] = `import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ${P}Model } from '../../domain/models/${k}.model';
import { I${P}Repository, I_${P.toUpperCase()}_REPOSITORY } from '../../domain/interfaces/i-${k}-repository';
import { I${P}Service } from '../interfaces/i-${k}-service';
import { Create${P}Dto } from '../dtos/create-${k}.dto';
import { Update${P}Dto } from '../dtos/update-${k}.dto';
import { ${P}ResponseDto } from '../dtos/${k}-response.dto';

@Injectable()
export class ${P}ApplicationService implements I${P}Service {
  constructor(
    @Inject(I_${P.toUpperCase()}_REPOSITORY)
    private readonly repository: I${P}Repository,
  ) {}

  async create(dto: Create${P}Dto): Promise<${P}ResponseDto> {
    const model = ${P}Model.create({ id: randomUUID(), name: dto.name });
    const saved = await this.repository.save(model);
    return this.toDto(saved);
  }

  async findById(id: string): Promise<${P}ResponseDto> {
    const model = await this.repository.findById(id);
    if (!model) throw new NotFoundException(\`${P} "\${id}" not found\`);
    return this.toDto(model);
  }

  async findAll(): Promise<${P}ResponseDto[]> {
    return (await this.repository.findAll()).map((m) => this.toDto(m));
  }

  async update(id: string, dto: Update${P}Dto): Promise<${P}ResponseDto> {
    const model = await this.repository.findById(id);
    if (!model) throw new NotFoundException(\`${P} "\${id}" not found\`);
    if (dto.name) model.update(dto.name);
    const updated = await this.repository.update(model);
    return this.toDto(updated);
  }

  async delete(id: string): Promise<void> {
    const model = await this.repository.findById(id);
    if (!model) throw new NotFoundException(\`${P} "\${id}" not found\`);
    await this.repository.delete(id);
  }

  private toDto(model: ${P}Model): ${P}ResponseDto {
    return { id: model.id, name: model.name, createdAt: model.createdAt, updatedAt: model.updatedAt };
  }
}
`;

  // ── Infrastructure Layer (outermost) ─────────────────────────────────────────

  files[`src/${k}/infrastructure/persistence/typeorm/${k}.orm-entity.ts`] = `import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('${k}s')
export class ${P}OrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
`;

  files[`src/${k}/infrastructure/persistence/typeorm/${k}.repository.mapper.ts`] = `import { ${P}Model } from '../../../domain/models/${k}.model';
import { ${P}OrmEntity } from './${k}.orm-entity';

export class ${P}RepositoryMapper {
  static toDomain(orm: ${P}OrmEntity): ${P}Model {
    return new ${P}Model(orm.id, orm.name, orm.createdAt, orm.updatedAt);
  }

  static toOrm(model: ${P}Model): ${P}OrmEntity {
    const orm = new ${P}OrmEntity();
    orm.id = model.id;
    orm.name = model.name;
    orm.createdAt = model.createdAt;
    orm.updatedAt = model.updatedAt;
    return orm;
  }
}
`;

  files[`src/${k}/infrastructure/persistence/typeorm/${k}.repository.impl.ts`] = `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${P}Model } from '../../../domain/models/${k}.model';
import { I${P}Repository } from '../../../domain/interfaces/i-${k}-repository';
import { ${P}OrmEntity } from './${k}.orm-entity';
import { ${P}RepositoryMapper } from './${k}.repository.mapper';

@Injectable()
export class ${P}RepositoryImpl implements I${P}Repository {
  constructor(
    @InjectRepository(${P}OrmEntity)
    private readonly repo: Repository<${P}OrmEntity>,
  ) {}

  async findById(id: string): Promise<${P}Model | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? ${P}RepositoryMapper.toDomain(row) : null;
  }

  async findAll(): Promise<${P}Model[]> {
    return (await this.repo.find()).map(${P}RepositoryMapper.toDomain);
  }

  async save(model: ${P}Model): Promise<${P}Model> {
    return ${P}RepositoryMapper.toDomain(await this.repo.save(${P}RepositoryMapper.toOrm(model)));
  }

  async update(model: ${P}Model): Promise<${P}Model> {
    await this.repo.save(${P}RepositoryMapper.toOrm(model));
    return model;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
`;

  files[`src/${k}/infrastructure/http/${k}.controller.ts`] = `import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Inject, Param, Post, Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { I_${P.toUpperCase()}_SERVICE, I${P}Service } from '../../application/interfaces/i-${k}-service';
import { Create${P}Dto } from '../../application/dtos/create-${k}.dto';
import { Update${P}Dto } from '../../application/dtos/update-${k}.dto';

@ApiTags('${k}s')
@Controller('${k}s')
export class ${P}Controller {
  constructor(
    @Inject(I_${P.toUpperCase()}_SERVICE)
    private readonly service: I${P}Service,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create ${c}' })
  create(@Body() dto: Create${P}Dto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ${c}s' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ${c} by id' })
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update ${c}' })
  update(@Param('id') id: string, @Body() dto: Update${P}Dto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete ${c}' })
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
`;

  // ── Module ────────────────────────────────────────────────────────────────────

  files[`src/${k}/${k}.module.ts`] = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${P}OrmEntity } from './infrastructure/persistence/typeorm/${k}.orm-entity';
import { ${P}RepositoryImpl } from './infrastructure/persistence/typeorm/${k}.repository.impl';
import { ${P}Controller } from './infrastructure/http/${k}.controller';
import { ${P}ApplicationService } from './application/services/${k}.application-service';
import { I_${P.toUpperCase()}_REPOSITORY } from './domain/interfaces/i-${k}-repository';
import { I_${P.toUpperCase()}_SERVICE } from './application/interfaces/i-${k}-service';

@Module({
  imports: [TypeOrmModule.forFeature([${P}OrmEntity])],
  controllers: [${P}Controller],
  providers: [
    { provide: I_${P.toUpperCase()}_REPOSITORY, useClass: ${P}RepositoryImpl },
    { provide: I_${P.toUpperCase()}_SERVICE, useClass: ${P}ApplicationService },
  ],
})
export class ${P}Module {}
`;

  return files;
}

module.exports = { onionModuleFiles };
