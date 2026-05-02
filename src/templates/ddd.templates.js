'use strict';

const { pascal, camel, kebab } = require('../utils/string');

function dddModuleFiles(mod) {
  const P = pascal(mod);
  const c = camel(mod);
  const k = kebab(mod);
  const files = {};

  // ── Domain Layer ────────────────────────────────────────────────────────────

  files[`src/${k}/domain/entities/${k}.entity.ts`] = `export class ${P} {
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

  files[`src/${k}/domain/value-objects/${k}-id.value-object.ts`] = `export class ${P}Id {
  private readonly value: string;

  private constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('${P}Id cannot be empty');
    }
    this.value = value;
  }

  static of(value: string): ${P}Id {
    return new ${P}Id(value);
  }

  toString(): string {
    return this.value;
  }
}
`;

  files[`src/${k}/domain/repositories/i-${k}-repository.ts`] = `import { ${P} } from '../entities/${k}.entity';

export const I_${P.toUpperCase()}_REPOSITORY = Symbol('I${P}Repository');

export interface I${P}Repository {
  findById(id: string): Promise<${P} | null>;
  findAll(): Promise<${P}[]>;
  save(${c}: ${P}): Promise<${P}>;
  update(${c}: ${P}): Promise<${P}>;
  delete(id: string): Promise<void>;
}
`;

  files[`src/${k}/domain/events/${k}-created.event.ts`] = `export class ${P}CreatedEvent {
  constructor(
    public readonly ${c}Id: string,
    public readonly name: string,
    public readonly createdAt: Date,
  ) {}
}
`;

  // ── Application Layer ───────────────────────────────────────────────────────

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

  files[`src/${k}/application/mappers/${k}.mapper.ts`] = `import { ${P} } from '../../domain/entities/${k}.entity';
import { ${P}ResponseDto } from '../dtos/${k}-response.dto';

export class ${P}Mapper {
  static toDto(entity: ${P}): ${P}ResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
`;

  files[`src/${k}/application/use-cases/create-${k}.use-case.ts`] = `import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ${P} } from '../../domain/entities/${k}.entity';
import { I${P}Repository, I_${P.toUpperCase()}_REPOSITORY } from '../../domain/repositories/i-${k}-repository';
import { Create${P}Dto } from '../dtos/create-${k}.dto';
import { ${P}Mapper } from '../mappers/${k}.mapper';
import { ${P}ResponseDto } from '../dtos/${k}-response.dto';

@Injectable()
export class Create${P}UseCase {
  constructor(
    @Inject(I_${P.toUpperCase()}_REPOSITORY)
    private readonly ${c}Repository: I${P}Repository,
  ) {}

  async execute(dto: Create${P}Dto): Promise<${P}ResponseDto> {
    const entity = ${P}.create({ id: randomUUID(), name: dto.name });
    const saved = await this.${c}Repository.save(entity);
    return ${P}Mapper.toDto(saved);
  }
}
`;

  files[`src/${k}/application/use-cases/find-${k}.use-case.ts`] = `import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { I${P}Repository, I_${P.toUpperCase()}_REPOSITORY } from '../../domain/repositories/i-${k}-repository';
import { ${P}Mapper } from '../mappers/${k}.mapper';
import { ${P}ResponseDto } from '../dtos/${k}-response.dto';

@Injectable()
export class Find${P}UseCase {
  constructor(
    @Inject(I_${P.toUpperCase()}_REPOSITORY)
    private readonly ${c}Repository: I${P}Repository,
  ) {}

  async findById(id: string): Promise<${P}ResponseDto> {
    const entity = await this.${c}Repository.findById(id);
    if (!entity) throw new NotFoundException(\`${P} with id "\${id}" not found\`);
    return ${P}Mapper.toDto(entity);
  }

  async findAll(): Promise<${P}ResponseDto[]> {
    const entities = await this.${c}Repository.findAll();
    return entities.map(${P}Mapper.toDto);
  }
}
`;

  files[`src/${k}/application/use-cases/update-${k}.use-case.ts`] = `import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { I${P}Repository, I_${P.toUpperCase()}_REPOSITORY } from '../../domain/repositories/i-${k}-repository';
import { Update${P}Dto } from '../dtos/update-${k}.dto';
import { ${P}Mapper } from '../mappers/${k}.mapper';
import { ${P}ResponseDto } from '../dtos/${k}-response.dto';

@Injectable()
export class Update${P}UseCase {
  constructor(
    @Inject(I_${P.toUpperCase()}_REPOSITORY)
    private readonly ${c}Repository: I${P}Repository,
  ) {}

  async execute(id: string, dto: Update${P}Dto): Promise<${P}ResponseDto> {
    const entity = await this.${c}Repository.findById(id);
    if (!entity) throw new NotFoundException(\`${P} with id "\${id}" not found\`);
    if (dto.name) entity.update(dto.name);
    const updated = await this.${c}Repository.update(entity);
    return ${P}Mapper.toDto(updated);
  }
}
`;

  files[`src/${k}/application/use-cases/delete-${k}.use-case.ts`] = `import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { I${P}Repository, I_${P.toUpperCase()}_REPOSITORY } from '../../domain/repositories/i-${k}-repository';

@Injectable()
export class Delete${P}UseCase {
  constructor(
    @Inject(I_${P.toUpperCase()}_REPOSITORY)
    private readonly ${c}Repository: I${P}Repository,
  ) {}

  async execute(id: string): Promise<void> {
    const entity = await this.${c}Repository.findById(id);
    if (!entity) throw new NotFoundException(\`${P} with id "\${id}" not found\`);
    await this.${c}Repository.delete(id);
  }
}
`;

  // ── Infrastructure Layer ────────────────────────────────────────────────────

  files[`src/${k}/infrastructure/persistence/typeorm/${k}.typeorm-entity.ts`] = `import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

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

  files[`src/${k}/infrastructure/persistence/typeorm/${k}.typeorm-repository.ts`] = `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${P} } from '../../../../domain/entities/${k}.entity';
import { I${P}Repository } from '../../../../domain/repositories/i-${k}-repository';
import { ${P}TypeormEntity } from './${k}.typeorm-entity';

@Injectable()
export class ${P}TypeormRepository implements I${P}Repository {
  constructor(
    @InjectRepository(${P}TypeormEntity)
    private readonly repo: Repository<${P}TypeormEntity>,
  ) {}

  async findById(id: string): Promise<${P} | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<${P}[]> {
    const rows = await this.repo.find();
    return rows.map(this.toDomain);
  }

  async save(entity: ${P}): Promise<${P}> {
    const row = this.toOrm(entity);
    const saved = await this.repo.save(row);
    return this.toDomain(saved);
  }

  async update(entity: ${P}): Promise<${P}> {
    const row = this.toOrm(entity);
    await this.repo.save(row);
    return entity;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(row: ${P}TypeormEntity): ${P} {
    return new ${P}(row.id, row.name, row.createdAt, row.updatedAt);
  }

  private toOrm(entity: ${P}): ${P}TypeormEntity {
    const row = new ${P}TypeormEntity();
    row.id = entity.id;
    row.name = entity.name;
    row.createdAt = entity.createdAt;
    row.updatedAt = entity.updatedAt;
    return row;
  }
}
`;

  files[`src/${k}/infrastructure/http/controllers/${k}.controller.ts`] = `import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Post, Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Create${P}UseCase } from '../../../application/use-cases/create-${k}.use-case';
import { Find${P}UseCase } from '../../../application/use-cases/find-${k}.use-case';
import { Update${P}UseCase } from '../../../application/use-cases/update-${k}.use-case';
import { Delete${P}UseCase } from '../../../application/use-cases/delete-${k}.use-case';
import { Create${P}Dto } from '../../../application/dtos/create-${k}.dto';
import { Update${P}Dto } from '../../../application/dtos/update-${k}.dto';

@ApiTags('${k}s')
@Controller('${k}s')
export class ${P}Controller {
  constructor(
    private readonly create${P}: Create${P}UseCase,
    private readonly find${P}: Find${P}UseCase,
    private readonly update${P}: Update${P}UseCase,
    private readonly delete${P}: Delete${P}UseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create ${c}' })
  create(@Body() dto: Create${P}Dto) {
    return this.create${P}.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ${c}s' })
  findAll() {
    return this.find${P}.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ${c} by id' })
  findOne(@Param('id') id: string) {
    return this.find${P}.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update ${c}' })
  update(@Param('id') id: string, @Body() dto: Update${P}Dto) {
    return this.update${P}.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete ${c}' })
  remove(@Param('id') id: string) {
    return this.delete${P}.execute(id);
  }
}
`;

  // ── Module ──────────────────────────────────────────────────────────────────

  files[`src/${k}/${k}.module.ts`] = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${P}TypeormEntity } from './infrastructure/persistence/typeorm/${k}.typeorm-entity';
import { ${P}TypeormRepository } from './infrastructure/persistence/typeorm/${k}.typeorm-repository';
import { ${P}Controller } from './infrastructure/http/controllers/${k}.controller';
import { I_${P.toUpperCase()}_REPOSITORY } from './domain/repositories/i-${k}-repository';
import { Create${P}UseCase } from './application/use-cases/create-${k}.use-case';
import { Find${P}UseCase } from './application/use-cases/find-${k}.use-case';
import { Update${P}UseCase } from './application/use-cases/update-${k}.use-case';
import { Delete${P}UseCase } from './application/use-cases/delete-${k}.use-case';

const useCases = [Create${P}UseCase, Find${P}UseCase, Update${P}UseCase, Delete${P}UseCase];

@Module({
  imports: [TypeOrmModule.forFeature([${P}TypeormEntity])],
  controllers: [${P}Controller],
  providers: [
    ...useCases,
    { provide: I_${P.toUpperCase()}_REPOSITORY, useClass: ${P}TypeormRepository },
  ],
})
export class ${P}Module {}
`;

  return files;
}

module.exports = { dddModuleFiles };
