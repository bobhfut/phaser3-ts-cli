const fs = require('fs-extra')
const path = require('path')
const ejs = require('ejs')
const prompts = require('prompts')
const chalk = require('chalk')
const execa = require('execa')
const { promisify } = require('util')
const glob = promisify(require('glob'))
const rimraf = promisify(require('rimraf'))

const { hasGit, hasProjectGit } = require('./utils')

let templateFileTree = new Map()
let projectName = ''
let packageName = ''
let author = ''
let description = ''

function createTemplateFileTree(templatePath, currentPath = '') {
  fs.readdirSync(path.join(templatePath, currentPath)).forEach(f => {
    let isDirectory = fs.lstatSync(path.join(templatePath, currentPath, f)).isDirectory()
    if (isDirectory) {
      createTemplateFileTree(templatePath, path.join(currentPath, f))
    } else {
      if (f.endsWith('.ejs')) {
        let file = fs.readFileSync(path.join(templatePath, currentPath, f), { encoding: 'utf8' })
        let output = ejs.render(file, { packageName, author, description })
        templateFileTree.set(path.join(currentPath, f.slice(0, -4)), output)
      } else {
        let file = fs.readFileSync(path.join(templatePath, currentPath, f))
        templateFileTree.set(path.join(currentPath, f), file)
      }
    }
  })
}

function writeTemplateFileTree(targetPath) {
  templateFileTree.forEach((file, filePath) => {
    let targetFilePath = path.join(targetPath, filePath)
    fs.ensureFileSync(targetFilePath)
    fs.writeFileSync(targetFilePath, file)
  })
}

function shouldInitGit(cwd) {
  if (!hasGit()) {
    return false
  }
  // default: true unless already in a git repo
  return !hasProjectGit(cwd)
}

module.exports = async function create(args, options, logger) {
  projectName = args.project
  let projectPath = path.join(process.cwd(), projectName)
  if (fs.existsSync(projectPath)) {
    const mergeFilesQuestions = [{
      type: 'select',
      name: 'rmProject',
      message: `${projectName} exists, do you want to overwhite it?`,
      choices: [
        { title: 'no', value: false },
        { title: 'yes', value: true }
      ]
    }]
    let response = await prompts(mergeFilesQuestions)
    if (response.rmProject) {
      const files = await glob(path.join(projectPath, '*'), {
        ignore: ['.git']
      })

      await Promise.all(files.map(file => rimraf(file)))
    } else {
      return
    }
  }
  let questions = [
    {
      type: 'text',
      name: 'name',
      initial: projectName,
      message: 'Package name :'
    },
    {
      type: 'text',
      name: 'description',
      message: 'Description :'
    },
    {
      type: 'text',
      name: 'author',
      message: 'Author :'
    }
  ]
  let response = await prompts(questions)
  packageName = response.name
  author = response.author
  description = response.description
  let templateRootPath = path.resolve(__dirname, `../templates/phaser3-typescript-webpack`)
  createTemplateFileTree(templateRootPath)
  writeTemplateFileTree(projectPath)
  console.log(chalk`{white.bgGreen  Success } Template created`)
  if (shouldInitGit(projectPath)) {
    await execa('git', ['init'], { cwd: projectPath })
    console.log(chalk`{white.bgGreen  Success } Git init`)
  }
  console.log(`Get started with the following commands:\n\n` +
    chalk` {grey $} cd ${projectName}\n` +
    chalk` {grey $} npm install\n` +
    chalk` {grey $} npm start\n`
  )
}
