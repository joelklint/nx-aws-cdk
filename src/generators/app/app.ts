import {
  GeneratorCallback,
  NX_VERSION,
  Tree,
  addProjectConfiguration,
  ensurePackage,
  generateFiles,
  joinPathFragments,
  offsetFromRoot,
  runTasksInSerial,
  formatFiles,
} from '@nx/devkit';
import { determineProjectNameAndRootOptions } from '@nx/devkit/src/generators/project-name-and-root-utils';
import { join } from 'path';
import { appifyGenerator } from '../appify/appify';
import { AppGeneratorSchema } from './schema';

interface NormalizedSchema extends AppGeneratorSchema {
  projectRoot: string;
  parsedTags: string[];
}

async function normalizeOptions(
  tree: Tree,
  options: AppGeneratorSchema
): Promise<NormalizedSchema> {
  const { projectName, projectRoot } = await determineProjectNameAndRootOptions(
    tree,
    {
      name: options.name,
      projectType: 'application',
      directory: options.directory,
      projectNameAndRootFormat: options.projectNameAndRootFormat,
      rootProject: false,
      callingGenerator: '@nx-iac/aws-cdk:app',
    }
  );

  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    name: projectName,
    projectRoot,
    parsedTags,
  };
}

function createProjectConfiguration(tree: Tree, options: NormalizedSchema) {
  addProjectConfiguration(tree, options.name, {
    root: options.projectRoot,
    sourceRoot: joinPathFragments(options.projectRoot, 'src'),
    projectType: 'application',
    targets: {},
    tags: options.parsedTags,
  });
}

async function addBuildCapabilities(
  tree: Tree,
  options: NormalizedSchema
): Promise<GeneratorCallback> {
  const { getRelativePathToRootTsConfig } = ensurePackage('@nx/js', NX_VERSION);

  generateFiles(tree, join(__dirname, './files'), options.projectRoot, {
    ...options,
    tmpl: '',
    offset: offsetFromRoot(options.projectRoot),
    rootTsConfigPath: getRelativePathToRootTsConfig(tree, options.projectRoot),
  });

  const { configurationGenerator: esbuildGenerator } = ensurePackage(
    '@nx/esbuild',
    NX_VERSION
  );
  return await esbuildGenerator(tree, {
    project: options.name,
  });
}

async function addTestCapabilities(
  tree: Tree,
  options: NormalizedSchema
): Promise<GeneratorCallback> {
  const { configurationGenerator: jestGenerator } = ensurePackage(
    '@nx/jest',
    NX_VERSION
  );

  return await jestGenerator(tree, {
    project: options.name,
  });
}

async function addLintCapabilities(
  tree: Tree,
  options: NormalizedSchema
): Promise<GeneratorCallback> {
  const { lintProjectGenerator: eslintGenerator } = ensurePackage(
    '@nx/eslint',
    NX_VERSION
  );

  return await eslintGenerator(tree, {
    project: options.name,
    eslintFilePatterns: [joinPathFragments(options.projectRoot, '**', '*.ts')],
  });
}

async function addCdkCapabilities(
  tree: Tree,
  options: NormalizedSchema
): Promise<GeneratorCallback> {
  return await appifyGenerator(tree, {
    project: options.name,
  });
}

export async function appGenerator(tree: Tree, options: AppGeneratorSchema) {
  const normalizedOptions = await normalizeOptions(tree, options);
  const tasks: GeneratorCallback[] = [];

  createProjectConfiguration(tree, normalizedOptions);

  tasks.push(await addBuildCapabilities(tree, normalizedOptions));

  tasks.push(await addTestCapabilities(tree, normalizedOptions));

  tasks.push(await addLintCapabilities(tree, normalizedOptions));

  tasks.push(await addCdkCapabilities(tree, normalizedOptions));

  await formatFiles(tree);

  return runTasksInSerial(...tasks);
}
export default appGenerator;
