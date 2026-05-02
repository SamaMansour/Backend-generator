'use strict';

const { pascal, camel, kebab } = require('../utils/string');

function hexModuleFiles(mod) {
  const P = pascal(mod);
  const c = camel(mod);
  const k = kebab(mod);
  const files = {};

  // ── Core: Domain ────────────────────────────────────────────────────────────

  files[`src/${k}/core/domain/${k}.entity.ts`] = `export class ${P} {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(props: { id: string; name: string }): ${P} {
    return new ${P}(props.id, props.name, new Date(), new Date());
  }

  update(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }
}
`;

  // ── Core: Ports In (Driving) ─────────────────────────────────────────────────

  files[`src/${k}/core/ports/in/create-${k}.port.ts`] = `import { Create${P}Dto } from '../../dtos/create-${k}.dto';
import { ${P}ResponseDto } from '../../dtos/${k}-response.dto';

export const CREATE_${P.toUpperCase()}_PORT = Symbol('Create${P}Port');

export interface Create${P}Port {
  execute(dto: Create${P}Dto): Promise<${P}ResponseDto>;
}
`;

  files[`src/${k}/core/ports/in/find-${k}.port.ts`] = `import { ${P}ResponseDto } from '../../dtos/${k}-response.dto';

export const FIND_${P.toUpperCase()}_PORT = Symbol('Find${P}Port');

export interface Find${P}Port {
  findById(id: string): Promise<${P}ResponseDto>;
  findAll(): Promise<${P}ResponseDto[]>;
}
`;

  files[`src/${k}/core/ports/in/update-${k}.port.ts`] = `import { Update${P}Dto } from '../../dtos/update-${k}.dto';
import { ${P}ResponseDto } from '../../dtos/${k}-response.dto';

export const UPDATE_${P.toUpperCase()}_PORT = Symbol('Update${P}Port');

export interface Update${P}Port {
  execute(id: string, dto: Update${P}Dto): Promise<${P}ResponseDto>;
}
`;

  files[`src/${k}/core/ports/in/delete-${k}.port.ts`] = `export const DELETE_${P.toUpperCase()}_PORT = Symbol('Delete${P}Port');

export interface Delete${P}Port {
  execute(id: string): Promise<void>;
}
`;

  // ── Core: Ports Out (Driven) ─────────────────────────────────────────────────

  files[`src/${k}/core/ports/out/${k}-repository.port.ts`] = `import { ${P} } from '../domain/${k}.entity';

export const ${P.toUpperCase()}_REPOSITORY_PORT = Symbol('${P}RepositoryPort');

export interface ${P}RepositoryPort {
  findById(id: string): Promise<${P} | null>;
  findAll(): Promise<${P}[]>;
  save(entity: ${P}): Promise<${P}>;
  update(entity: ${P}): Promise<${P}>;
  delete(id: string): Promise<void>;
}
`;

  // ── Core: DTOs ───────────────────────────────────────────────────────────────

  files[`src/${k}/core/dtos/create-${k}.dto.ts`] = `import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Create${P}Dto {
  @ApiProperty({ example: 'My ${P}' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}
`;

  files[`src/${k}/core/dtos/update-${k}.dto.ts`] = `import { PartialType } from '@nestjs/swagger';
import { Create${P}Dto } from './create-${k}.dto';

export class Update${P}Dto extends PartialType(Create${P}Dto) {}
`;

  files[`src/${k}/core/dtos/${k}-response.dto.ts`] = `import { ApiProperty } from '@nestjs/swagger';

export class ${P}ResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
`;

  // ── Core: Application Service ────────────────────────────────────────────────

  files[`src/${k}/core/services/${k}.service.ts`] = `import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ${P} } from '../domain/${k}.entity';
import { ${P}RepositoryPort, ${P.toUpperCase()}_REPOSITORY_PORT } from '../ports/out/${k}-repository.port';
import { Create${P}Port } from '../ports/in/create-${k}.port';
import { Find${P}Port } from '../ports/in/find-${k}.port';
import { Update${P}Port } from '../ports/in/update-${k}.port';
import { Delete${P}Port } from '../ports/in/delete-${k}.port';
import { Create${P}Dto } from '../dtos/create-${k}.dto';
import { Update${P}Dto } from '../dtos/update-${k}.dto';
import { ${P}ResponseDto } from '../dtos/${k}-response.dto';

@Injectable()
export class ${P}Service implements Create${P}Port, Find${P}Port, Update${P}Port, Delete${P}Port {
  constructor(
    @Inject(${P.toUpperCase()}_REPOSITORY_PORT)
    private readonly repository: ${P}RepositoryPort,
  ) {}

  async execute(dto: Create${P}Dto): Promise<${P}ResponseDto> {
    const entity = ${P}.create({ id: randomUUID(), name: dto.name });
    const saved = await this.repository.save(entity);
    return this.toDto(saved);
  }

  async findById(id: string): Promise<${P}ResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException(\`${P} "\${id}" not found\`);
    return this.toDto(entity);
  }

  async findAll(): Promise<${P}ResponseDto[]> {
    const entities = await this.repository.findAll();
    return entities.map((e) => this.toDto(e));
  }

  async execute(id: string, dto: Update${P}Dto): Promise<${P}ResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException(\`${P} "\${id}" not found\`);
    if (dto.name) entity.update(dto.name);
    const updated = await this.repository.update(entity);
    return this.toDto(updated);
  }

  async execute(id: string): Promise<void> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException(\`${P} "\${id}" not found\`);
    await this.repository.delete(id);
  }

  private toDto(entity: ${P}): ${P}ResponseDto {
    return { id: entity.id, name: entity.name, createdAt: entity.createdAt, updatedAt: entity.updatedAt };
  }
}
`;

  // ── Adapter In: HTTP ─────────────────────────────────────────────────────────

  files[`src/${k}/adapters/in/http/${k}.controller.ts`] = `import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Inject, Param, Post, Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CREATE_${P.toUpperCase()}_PORT, Create${P}Port } from '../../../core/ports/in/create-${k}.port';
import { FIND_${P.toUpperCase()}_PORT, Find${P}Port } from '../../../core/ports/in/find-${k}.port';
import { UPDATE_${P.toUpperCase()}_PORT, Update${P}Port } from '../../../core/ports/in/update-${k}.port';
import { DELETE_${P.toUpperCase()}_PORT, Delete${P}Port } from '../../../core/ports/in/delete-${k}.port';
import { Create${P}Dto } from '../../../core/dtos/create-${k}.dto';
import { Update${P}Dto } from '../../../core/dtos/update-${k}.dto';

@ApiTags('${k}s')
@Controller('${k}s')
export class ${P}Controller {
  constructor(
    @Inject(CREATE_${P.toUpperCase()}_PORT) private readonly createPort: Create${P}Port,
    @Inject(FIND_${P.toUpperCase()}_PORT) private readonly findPort: Find${P}Port,
    @Inject(UPDATE_${P.toUpperCase()}_PORT) private readonly updatePort: Update${P}Port,
    @Inject(DELETE_${P.toUpperCase()}_PORT) private readonly deletePort: Delete${P}Port,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create ${c}' })
  create(@Body() dto: Create${P}Dto) {
    return this.createPort.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ${c}s' })
  findAll() {
    return this.findPort.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ${c} by id' })
  findOne(@Param('id') id: string) {
    return this.findPort.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update ${c}' })
  update(@Param('id') id: string, @Body() dto: Update${P}Dto) {
    return this.updatePort.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete ${c}' })
  remove(@Param('id') id: string) {
    return this.deletePort.execute(id);
  }
}
`;

  // ── Adapter Out: Persistence ─────────────────────────────────────────────────

  files[`src/${k}/adapters/out/persistence/typeorm/${k}.typeorm-entity.ts`] = `import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('${k}s')
export class ${P}TypeormEntity {
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

  files[`src/${k}/adapters/out/persistence/typeorm/${k}.typeorm-repository.ts`] = `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${P} } from '../../../../core/domain/${k}.entity';
import { ${P}RepositoryPort } from '../../../../core/ports/out/${k}-repository.port';
import { ${P}TypeormEntity } from './${k}.typeorm-entity';

@Injectable()
export class ${P}TypeormRepository implements ${P}RepositoryPort {
  constructor(
    @InjectRepository(${P}TypeormEntity)
    private readonly repo: Repository<${P}TypeormEntity>,
  ) {}

  async findById(id: string): Promise<${P} | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<${P}[]> {
    return (await this.repo.find()).map(this.toDomain);
  }

  async save(entity: ${P}): Promise<${P}> {
    return this.toDomain(await this.repo.save(this.toOrm(entity)));
  }

  async update(entity: ${P}): Promise<${P}> {
    await this.repo.save(this.toOrm(entity));
    return entity;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(row: ${P}TypeormEntity): ${P} {
    return new ${P}(row.id, row.name, row.createdAt, row.updatedAt);
  }

  private toOrm(e: ${P}): ${P}TypeormEntity {
    const row = new ${P}TypeormEntity();
    Object.assign(row, e);
    return row;
  }
}
`;

  // ── Module ───────────────────────────────────────────────────────────────────

  files[`src/${k}/${k}.module.ts`] = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${P}TypeormEntity } from './adapters/out/persistence/typeorm/${k}.typeorm-entity';
import { ${P}TypeormRepository } from './adapters/out/persistence/typeorm/${k}.typeorm-repository';
import { ${P}Controller } from './adapters/in/http/${k}.controller';
import { ${P}Service } from './core/services/${k}.service';
import { ${P.toUpperCase()}_REPOSITORY_PORT } from './core/ports/out/${k}-repository.port';
import { CREATE_${P.toUpperCase()}_PORT, FIND_${P.toUpperCase()}_PORT, UPDATE_${P.toUpperCase()}_PORT, DELETE_${P.toUpperCase()}_PORT } from './core/ports/in/create-${k}.port';

@Module({
  imports: [TypeOrmModule.forFeature([${P}TypeormEntity])],
  controllers: [${P}Controller],
  providers: [
    ${P}Service,
    { provide: ${P.toUpperCase()}_REPOSITORY_PORT, useClass: ${P}TypeormRepository },
    { provide: CREATE_${P.toUpperCase()}_PORT, useExisting: ${P}Service },
    { provide: FIND_${P.toUpperCase()}_PORT, useExisting: ${P}Service },
    { provide: UPDATE_${P.toUpperCase()}_PORT, useExisting: ${P}Service },
    { provide: DELETE_${P.toUpperCase()}_PORT, useExisting: ${P}Service },
  ],
})
export class ${P}Module {}
`;

  return files;
}

module.exports = { hexModuleFiles };
