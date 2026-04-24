import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const sourceRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(sourceRoot, '..')

const packageJsonPath = path.join(sourceRoot, 'package.json')
const versionTsPath = path.join(sourceRoot, 'src', 'lib', 'version.ts')
const readmePath = path.join(repoRoot, 'README.md')

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
const version = String(packageJson.version || '').trim()

if (!version) {
  throw new Error('Version is missing in SOURCE/package.json')
}

fs.writeFileSync(versionTsPath, `export const APP_VERSION = '${version}'\n`, 'utf8')

const readme = fs.readFileSync(readmePath, 'utf8')
const updatedReadme = readme
  .replace(/^# DIVI JSON Transformer v[^\r\n]+/m, `# DIVI JSON Transformer v${version}`)
  .replace(/^\*\*Version\*\*:\s*[^\r\n]+/m, `**Version**: ${version}`)

if (readme !== updatedReadme) {
  fs.writeFileSync(readmePath, updatedReadme, 'utf8')
}

console.log(`Synchronized version ${version}`)
