const { execSync } = require('child_process')

let _hasGit

exports.hasGit = () => {
  if (_hasGit != null) {
    return _hasGit
  }
  try {
    execSync('git --version', { stdio: 'ignore' })
    return (_hasGit = true)
  } catch (e) {
    return (_hasGit = false)
  }
}

exports.hasProjectGit = (cwd) => {
  let result
  try {
    execSync('git status', { stdio: 'ignore', cwd })
    result = true
  } catch (e) {
    result = false
  }
  return result
}


exports.getGitCommitHash = (cwd) => {
  return execSync('git rev-parse HEAD', {
    cwd,
  })
  .toString()
  .replace(/\s/, '')
}

exports.getGitUnCommitMessage = cwd => {
  return execSync('git status --porcelain', { cwd }).toString()
}

exports.getGitBranch = cwd => {
  return execSync('git rev-parse --abbrev-ref HEAD', { cwd }).toString().trim()
}
