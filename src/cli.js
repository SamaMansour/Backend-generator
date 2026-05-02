#!/usr/bin/env node

'use strict';

const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { generateArchitecture } = require('./generators/index');

const PATTERNS = {
  ddd: 'Domain-Driven Design (DDD)',
  hexagonal: 'Hexagonal Architecture (Ports & Adapters)',
  onion: 'Onion Architecture',
};

async function promptUser(projectName, pattern, opts = {}) {
  const questions = [];

  if (!projectName) {
    questions.push({
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      validate: (v) => (v.trim() ? true : 'Project name is required'),
    });
  }

  if (!pattern) {
    questions.push({
      type: 'list',
      name: 'pattern',
      message: 'Select architecture pattern:',
      choices: Object.entries(PATTERNS).map(([value, name]) => ({ name, value })),
    });
  }

  if (!opts.modules) {
    questions.push({
      type: 'input',
      name: 'modules',
      message: 'Initial modules (comma-separated, e.g. user,order,product):',
      default: 'user',
      filter: (v) => v.split(',').map((m) => m.trim().toLowerCase()).filter(Boolean),
    });
  }

  questions.push({
    type: 'confirm',
    name: 'includeDocker',
    message: 'Include Dockerfile & docker-compose?',
    default: true,
  });

  questions.push({
    type: 'confirm',
    name: 'includeSwagger',
    message: 'Include Swagger/OpenAPI setup?',
    default: true,
  });

  const answers = await inquirer.prompt(questions);

  const modules = opts.modules
    ? opts.modules.split(',').map((m) => m.trim().toLowerCase()).filter(Boolean)
    : answers.modules;

  return {
    projectName: projectName || answers.projectName,
    pattern: pattern || answers.pattern,
    modules,
    includeDocker: answers.includeDocker,
    includeSwagger: answers.includeSwagger,
  };
}

program
  .name('nestgen')
  .description('NestJS architecture generator — DDD, Hexagonal, Onion')
  .version('1.0.0');

program
  .command('new [project-name]')
  .alias('n')
  .description('Generate a new NestJS project with a chosen architecture pattern')
  .option('-p, --pattern <pattern>', 'Architecture pattern: ddd | hexagonal | onion')
  .option('-m, --modules <modules>', 'Comma-separated module names (skips prompt)')
  .option('-y, --yes', 'Accept all defaults (skips docker & swagger prompts)')
  .action(async (projectName, opts) => {
    console.log(chalk.bold.cyan('\n  NestJS Architecture Generator\n'));

    const pattern = opts.pattern && PATTERNS[opts.pattern] ? opts.pattern : null;
    if (opts.pattern && !pattern) {
      console.log(chalk.yellow(`  Unknown pattern "${opts.pattern}". Choose from: ddd, hexagonal, onion\n`));
    }

    // allow fully non-interactive usage
    if (opts.yes && projectName && pattern && opts.modules) {
      const config = {
        projectName,
        pattern,
        modules: opts.modules.split(',').map((m) => m.trim().toLowerCase()).filter(Boolean),
        includeDocker: true,
        includeSwagger: true,
      };
      console.log('');
      await generateArchitecture(config);
      return;
    }

    const config = await promptUser(projectName, pattern, opts);

    console.log('');
    await generateArchitecture(config);
  });

program
  .command('list')
  .description('List available architecture patterns')
  .action(() => {
    console.log(chalk.bold.cyan('\n  Available Architecture Patterns:\n'));
    Object.entries(PATTERNS).forEach(([key, label]) => {
      console.log(`  ${chalk.green(key.padEnd(12))} ${chalk.white(label)}`);
    });
    console.log('');
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
