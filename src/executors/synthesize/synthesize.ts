import { ExecutorContext } from '@nx/devkit';
import { rmSync } from 'node:fs';
import { runCdkCommand } from '../../utils/shell';
import { SynthesizeExecutorSchema } from './schema';
import { join } from 'node:path';
import { buildCdkProjectCommand } from '../../utils/cdkCommandBuilder';

export async function synthesizeExecutor(
  options: SynthesizeExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  rmSync(options.output, {
    recursive: true,
    force: true,
  });

  const projects = context.projectsConfigurations.projects;
  const workspaceRoot = context.root;
  const projectRoot = projects[context.projectName].root;

  const command = buildCdkProjectCommand({
    workspaceRoot,
    projectRoot,
    command: 'synthesize',
    args: {
      ...options,
    },
  });

  const result = await runCdkCommand({
    workDir: join(workspaceRoot, projectRoot),
    command,
  });

  return { success: result };
}

export default synthesizeExecutor;
