import { offsetFromRoot } from '@nx/devkit';
import { join } from 'node:path';

function buildCli(workspaceRoot: string): string {
  return join(workspaceRoot, 'node_modules/.bin/cdk');
}

interface BuildGenericCommandRequest {
  workspaceRoot: string;
  args: string[];
}

export function buildCdkGenericCommand(
  request: BuildGenericCommandRequest
): string {
  const { workspaceRoot, args } = request;

  const commandParts = [buildCli(workspaceRoot), ...args];

  return commandParts.join(' ');
}

interface BuildCdkProjectCommandRequest {
  workspaceRoot: string;
  command: string;
  projectRoot: string;
  args: {
    stacks?: string;
    app?: string;
    output?: string;
    hotswapFallback?: boolean;
    noRollback?: boolean;
    force?: boolean;
    quiet?: boolean;
  };
}

export function buildCdkProjectCommand(
  request: BuildCdkProjectCommandRequest
): string {
  const { projectRoot, command, args } = request;

  const convertedArgs: string[] = [command];

  if (args.stacks) convertedArgs.push(args.stacks);

  if (args.app)
    convertedArgs.push('--app', `"${relativeToRoot(projectRoot, args.app)}"`);

  if (args.quiet) convertedArgs.push('--quiet');

  if (args.output)
    convertedArgs.push('--output', relativeToRoot(projectRoot, args.output));

  if (args.hotswapFallback) convertedArgs.push('--hotswap-fallback');

  if (args.noRollback) convertedArgs.push('--no-rollback');

  if (args.force) convertedArgs.push('--force');

  return buildCdkGenericCommand({
    ...request,
    args: convertedArgs,
  });
}

function relativeToRoot(projectRoot: string, path: string): string {
  return join(offsetFromRoot(projectRoot), path);
}
