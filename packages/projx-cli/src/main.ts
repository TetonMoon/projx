#!/usr/bin/env node
import { parseArgs } from 'node:util';
import {
  addContainer,
  addFileReference,
  createProject,
  deserializeProject,
  removeItem,
  serializeProject,
} from '@tetonmoon/projx';
import type { ItemId, Project } from '@tetonmoon/projx';
import { FileProjectStore } from '@tetonmoon/projx-persistence-node';
import { findAddedItemId, formatProjectTree, resolveParentId } from './commands.js';

function requireOption(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required --${name} option.`);
  }
  return value;
}

async function loadProject(path: string): Promise<Project> {
  const data = await new FileProjectStore(path).load();
  return deserializeProject(data);
}

function printUsage(): void {
  console.log(`Usage: projx <command> [options]

Commands:
  create        --project <path> --name <name>
  list          --project <path>
  add-container --project <path> --name <name> [--parent <id>]
  add-file      --project <path> --name <name> --scheme <scheme> --identifier <id> [--display-name <name>] [--parent <id>]
  remove        --project <path> --id <itemId>`);
}

async function main(argv: string[]): Promise<void> {
  const [command, ...rest] = argv;

  switch (command) {
    case 'create': {
      const { values } = parseArgs({
        args: rest,
        options: { project: { type: 'string' }, name: { type: 'string' } },
      });
      const projectPath = requireOption(values.project, 'project');
      const name = requireOption(values.name, 'name');

      const project = createProject(name);
      await new FileProjectStore(projectPath).save(serializeProject(project));
      console.log(`Created project "${project.name}" (${project.id}) at ${projectPath}`);
      break;
    }

    case 'list': {
      const { values } = parseArgs({ args: rest, options: { project: { type: 'string' } } });
      const projectPath = requireOption(values.project, 'project');

      const project = await loadProject(projectPath);
      console.log(formatProjectTree(project));
      break;
    }

    case 'add-container': {
      const { values } = parseArgs({
        args: rest,
        options: {
          project: { type: 'string' },
          name: { type: 'string' },
          parent: { type: 'string' },
        },
      });
      const projectPath = requireOption(values.project, 'project');
      const name = requireOption(values.name, 'name');

      const project = await loadProject(projectPath);
      const updated = addContainer(project, resolveParentId(values.parent), name);
      await new FileProjectStore(projectPath).save(serializeProject(updated));
      console.log(`Added container "${name}" (${findAddedItemId(project, updated)})`);
      break;
    }

    case 'add-file': {
      const { values } = parseArgs({
        args: rest,
        options: {
          project: { type: 'string' },
          name: { type: 'string' },
          scheme: { type: 'string' },
          identifier: { type: 'string' },
          'display-name': { type: 'string' },
          parent: { type: 'string' },
        },
      });
      const projectPath = requireOption(values.project, 'project');
      const name = requireOption(values.name, 'name');
      const scheme = requireOption(values.scheme, 'scheme');
      const identifier = requireOption(values.identifier, 'identifier');

      const project = await loadProject(projectPath);
      const updated = addFileReference(project, resolveParentId(values.parent), name, {
        scheme,
        identifier,
        displayName: values['display-name'],
      });
      await new FileProjectStore(projectPath).save(serializeProject(updated));
      console.log(`Added file reference "${name}" (${findAddedItemId(project, updated)})`);
      break;
    }

    case 'remove': {
      const { values } = parseArgs({
        args: rest,
        options: { project: { type: 'string' }, id: { type: 'string' } },
      });
      const projectPath = requireOption(values.project, 'project');
      const id = requireOption(values.id, 'id');

      const project = await loadProject(projectPath);
      const updated = removeItem(project, id as ItemId);
      await new FileProjectStore(projectPath).save(serializeProject(updated));
      console.log(`Removed item ${id}`);
      break;
    }

    default: {
      printUsage();
      process.exitCode = command ? 1 : 0;
    }
  }
}

main(process.argv.slice(2)).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
