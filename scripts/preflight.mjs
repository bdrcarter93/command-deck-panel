import fs from 'node:fs';
import { execSync } from 'node:child_process';

function run(command) {
  return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

const issues = [];

const branch = run('git rev-parse --abbrev-ref HEAD');
const status = run('git status --short');

if (!['main', 'dev'].includes(branch)) {
  issues.push(`Expected branch to be main or dev, got ${branch}`);
}

if (status) {
  issues.push('Working tree is not clean');
}

if (!fs.existsSync('.vercel/project.json')) {
  issues.push('Missing .vercel/project.json');
}

if (!fs.existsSync('vercel.json')) {
  issues.push('Missing vercel.json');
}

if (!fs.existsSync('DEPLOY.md')) {
  issues.push('Missing DEPLOY.md');
}

console.log(`Branch: ${branch || '(unknown)'}`);
console.log(`Working tree: ${status ? 'dirty' : 'clean'}`);
console.log(`Vercel project: ${fs.existsSync('.vercel/project.json') ? 'present' : 'missing'}`);
console.log(`Deploy guide: ${fs.existsSync('DEPLOY.md') ? 'present' : 'missing'}`);

if (issues.length) {
  console.error('\nPreflight failed:');
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log('\nPreflight passed.');
