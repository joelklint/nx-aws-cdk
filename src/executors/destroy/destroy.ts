import { ExecutorContext } from '@nx/devkit';
import { runCdkCommand } from '../../utils/shell';
import { DestroyExecutorSchema } from './schema';
import { join } from 'node:path';
import { buildCdkProjectCommand } from '../../utils/cdkCommandBuilder';

export async function destroyExecutor(
  options: DestroyExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  const projects = context.projectsConfigurations.projects;
  const workspaceRoot = context.root;
  const projectRoot = projects[context.projectName].root;

  const command = buildCdkProjectCommand({
    workspaceRoot,
    projectRoot,
    command: 'destroy',
    args: options,
  });

  const result = await runCdkCommand({
    workDir: join(workspaceRoot, projectRoot),
    command,
  });

  return { success: result };
}

export default destroyExecutor;
