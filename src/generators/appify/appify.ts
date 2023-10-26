import {
  GeneratorCallback,
  Tree,
  formatFiles,
  generateFiles,
  joinPathFragments,
  names,
  offsetFromRoot,
  readProjectConfiguration,
  runTasksInSerial,
  updateProjectConfiguration,
} from '@nx/devkit';
import initGenerator from '../init/init';
import { AppifyGeneratorSchema } from './schema';
import { join } from 'path';

interface NormalizedSchema extends AppifyGeneratorSchema {
  projectRoot: string;
  namePascalCase: string;
  nameKebabCase: string;
}

function normalizeOptions(
  tree: Tree,
  options: AppifyGeneratorSchema
): NormalizedSchema {
  const project = readProjectConfiguration(tree, options.project);
  const { className, name } = names(options.project);

  return {
    ...options,
    projectRoot: project.root,
    namePascalCase: className,
    nameKebabCase: name,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  generateFiles(tree, join(__dirname, './files'), options.projectRoot, {
    tmpl: '',
    className: options.namePascalCase,
    stackName: options.nameKebabCase,
    cdkApp: `${joinPathFragments(
      offsetFromRoot(options.projectRoot),
      'node_modules/.bin/tsx'
    )} cdk/${options.namePascalCase}App.ts`,
  });
}

function addTargets(tree: Tree, options: NormalizedSchema) {
  const projectConfiguration = readProjectConfiguration(tree, options.project);
  updateProjectConfiguration(tree, options.project, {
    ...projectConfiguration,
    root: options.projectRoot,
    targets: {
      ...projectConfiguration.targets,
      package: {
        executor: '@nx-iac/aws-cdk:synthesize',
        dependsOn: ['build'],
        outputs: ['{options.output}'],
        options: {
          output: `cdk.out/${options.projectRoot}`,
          quiet: true,
        },
      },
      deploy: {
        executor: '@nx-iac/aws-cdk:deploy',
        dependsOn: ['package'],
        defaultConfiguration: 'normal',
        options: {
          app: `cdk.out/${options.projectRoot}`,
          stacks: '--all',
        },
        configurations: {
          normal: {},
          quick: {
            hotswapFallback: true,
            noRollback: true,
          },
        },
      },
      destroy: {
        executor: '@nx-iac/aws-cdk:destroy',
        dependsOn: ['package'],
        options: {
          app: `cdk.out/${options.projectRoot}`,
          stacks: '--all',
          force: true,
        },
      },
    },
  });
}

function updateIgnoreFile(tree: Tree, filename: string) {
  if (tree.exists(filename)) {
    const ignored = tree.read(filename, 'utf-8');
    if (!ignored.includes('cdk.out')) {
      tree.write(filename, [ignored, '/cdk.out'].join('\n'));
    }
  }
}

export async function appifyGenerator(
  tree: Tree,
  options: AppifyGeneratorSchema
) {
  const tasks: GeneratorCallback[] = [];

  tasks.push(await initGenerator(tree));

  const normalizedOptions = normalizeOptions(tree, options);

  addFiles(tree, normalizedOptions);

  addTargets(tree, normalizedOptions);

  updateIgnoreFile(tree, '.gitignore');
  updateIgnoreFile(tree, '.prettierignore');

  await formatFiles(tree);

  return runTasksInSerial(...tasks);
}

export default appifyGenerator;
