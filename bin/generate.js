#!/usr/bin/env node
const program = require('caporal');
const packageJson = require('../package.json');

const create = require('../src/create.js');

program
.version(packageJson.version)
.command('create', 'Create new project from template')
.argument('<project>', 'Project name to create')
.action(function (args, options, logger) {
  create(args, options, logger);
});

program.parse(process.argv);
