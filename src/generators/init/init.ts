import {
  GeneratorCallback,
  Tree,
  addDependenciesToPackageJson,
  runTasksInSerial,
} from '@nx/devkit';

export const CDK_VERSION = '^2.102.0' as const;
export const CONSTRUCTS_VERSION = '^10.3.0' as const;
export const TSX_VERSION = '^3.14.0' as const;

async function addDependencies(tree: Tree): Promise<GeneratorCallback> {
  return await addDependenciesToPackageJson(
    tree,
    {},
    {
      'aws-cdk': CDK_VERSION,
      'aws-cdk-lib': CDK_VERSION,
      constructs: CONSTRUCTS_VERSION,
      tsx: TSX_VERSION,
    }
  );
}

export async function initGenerator(tree: Tree): Promise<GeneratorCallback> {
  const tasks: GeneratorCallback[] = [];

  tasks.push(await addDependencies(tree));

  return runTasksInSerial(...tasks);
}

export default initGenerator;
