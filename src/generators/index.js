'use strict';

const chalk = require('chalk');
const ora = require('ora');
const { generateDDD } = require('./ddd');
const { generateHexagonal } = require('./hexagonal');
const { generateOnion } = require('./onion');
const { writeSharedFiles } = require('./shared');

const GENERATORS = {
  ddd: generateDDD,
  hexagonal: generateHexagonal,
  onion: generateOnion,
};

async function generateArchitecture(config) {
  const { projectName, pattern, modules, includeDocker, includeSwagger } = config;

  const spinner = ora(`Generating ${chalk.cyan(pattern.toUpperCase())} architecture for ${chalk.green(projectName)}...`).start();

  try {
    const generator = GENERATORS[pattern];
    const structure = generator({ projectName, modules, includeDocker, includeSwagger });

    writeSharedFiles(projectName, structure, { includeDocker, includeSwagger });

    spinner.succeed(chalk.green(`Project "${projectName}" generated successfully!`));

    printSummary(projectName, pattern, modules, includeDocker, includeSwagger);
  } catch (err) {
    spinner.fail(chalk.red('Generation failed: ' + err.message));
    process.exit(1);
  }
}

function printSummary(projectName, pattern, modules, includeDocker, includeSwagger) {
  console.log('\n' + chalk.bold('  Project Summary'));
  console.log('  ' + '─'.repeat(40));
  console.log(`  ${chalk.dim('Name:')}     ${chalk.white(projectName)}`);
  console.log(`  ${chalk.dim('Pattern:')}  ${chalk.cyan(pattern.toUpperCase())}`);
  console.log(`  ${chalk.dim('Modules:')}  ${chalk.white(modules.join(', '))}`);
  console.log(`  ${chalk.dim('Docker:')}   ${includeDocker ? chalk.green('yes') : chalk.dim('no')}`);
  console.log(`  ${chalk.dim('Swagger:')}  ${includeSwagger ? chalk.green('yes') : chalk.dim('no')}`);
  console.log('');
  console.log('  ' + chalk.bold('Next steps:'));
  console.log(`  ${chalk.cyan('cd')} ${projectName}`);
  console.log(`  ${chalk.cyan('npm install')}`);
  console.log(`  ${chalk.cyan('npm run start:dev')}`);
  console.log('');
}

module.exports = { generateArchitecture };
