import { ExecutorContext } from '@nx/devkit';
import { join } from 'node:path';
import { runCdkCommand } from '../../utils/shell';
import { DeployExecutorSchema } from './schema';
import { buildCdkProjectCommand } from '../../utils/cdkCommandBuilder';

export async function deployExecutor(
  options: DeployExecutorSchema,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  const projects = context.projectsConfigurations.projects;
  const workspaceRoot = context.root;
  const projectRoot = projects[context.projectName].root;

  const command = buildCdkProjectCommand({
    workspaceRoot,
    projectRoot,
    command: 'deploy',
    args: options,
  });

  const result = await runCdkCommand({
    workDir: join(workspaceRoot, projectRoot),
    command,
  });
  return { success: result };
}

export default deployExecutor;
