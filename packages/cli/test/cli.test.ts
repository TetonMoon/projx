import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
// Runs the built output (not src) since cross-package imports resolve through
// each package's compiled "main" entry, not its TypeScript source.
const cliPath = fileURLToPath(new URL('../dist/main.js', import.meta.url));

let dir: string;
let projectPath: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'projx-cli-'));
  projectPath = join(dir, 'project.json');
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

async function runCli(args: string[]): Promise<string> {
  const { stdout } = await execFileAsync(process.execPath, [cliPath, ...args]);
  return stdout.trim();
}

describe('projx CLI (run directly with node, unbuilt)', () => {
  it('creates a project, adds a container and a file reference, and lists them', async () => {
    const createOutput = await runCli(['create', '--project', projectPath, '--name', 'Demo']);
    expect(createOutput).toContain('Created project "Demo"');

    await runCli(['add-container', '--project', projectPath, '--name', 'Folder']);
    const afterFolder = await runCli(['list', '--project', projectPath]);
    expect(afterFolder).toContain('[container] Folder');

    await runCli([
      'add-file',
      '--project', projectPath,
      '--name', 'Report',
      '--scheme', 'word',
      '--identifier', 'doc-1',
      '--display-name', 'Report.docx',
    ]);
    const afterFile = await runCli(['list', '--project', projectPath]);
    expect(afterFile).toContain('[file-reference] Report');
  });

  it('removes an item', async () => {
    await runCli(['create', '--project', projectPath, '--name', 'Demo']);
    await runCli(['add-container', '--project', projectPath, '--name', 'Folder']);
    const listing = await runCli(['list', '--project', projectPath]);
    const id = /Folder \(([^)]+)\)/.exec(listing)![1]!;

    await runCli(['remove', '--project', projectPath, '--id', id]);

    const afterRemove = await runCli(['list', '--project', projectPath]);
    expect(afterRemove).not.toContain('Folder');
  });
});
