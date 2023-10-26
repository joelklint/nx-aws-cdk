import { GeneratorCallback, Tree, runTasksInSerial } from '@nx/devkit';
import { runCdkCommand } from '../../utils/shell';
import { BootstrapGeneratorSchema } from './schema';
import initGenerator from '../init/init';
import { buildCdkGenericCommand } from 'src/utils/cdkCommandBuilder';

export async function bootstrapGenerator(
  tree: Tree,
  options: BootstrapGeneratorSchema
): Promise<GeneratorCallback> {
  const tasks: GeneratorCallback[] = [];

  tasks.push(await initGenerator(tree));

  const workspaceRoot = tree.root;

  const command = buildCdkGenericCommand({
    workspaceRoot,
    args: ['bootstrap', `${options.accountId}/${options.region}`],
  });

  await runCdkCommand({
    workDir: workspaceRoot,
    command,
  });

  return runTasksInSerial(...tasks);
}

export default bootstrapGenerator;
