import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
if (existsSync('.git') && !process.env.CI) {
  execFileSync('git', ['config', 'core.hooksPath', '.githooks']);
}
