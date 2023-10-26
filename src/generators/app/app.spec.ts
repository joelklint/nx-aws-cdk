import {
  TargetConfiguration,
  Tree,
  readProjectConfiguration,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { appGenerator } from './app';

describe('app', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  require('../appify/appify.spec'); // Run all unit tests from appify

  it('should create a minimal project', async () => {
    await appGenerator(tree, {
      name: 'test-project',
      directory: 'test-project',
      projectNameAndRootFormat: 'as-provided',
    });

    const projectConfiguration = readProjectConfiguration(tree, 'test-project');
    expect(projectConfiguration.root).toEqual('test-project');
    expect(projectConfiguration.sourceRoot).toEqual('test-project/src');
    expect(projectConfiguration.projectType).toEqual('application');
  });

  it('should create a buildable project', async () => {
    await appGenerator(tree, {
      name: 'test-project',
      directory: 'test-project',
      projectNameAndRootFormat: 'as-provided',
    });

    const projectConfiguration = readProjectConfiguration(tree, 'test-project');
    expect(projectConfiguration.targets['build']).toEqual<TargetConfiguration>({
      executor: '@nx/esbuild:esbuild',
      outputs: ['{options.outputPath}'],
      defaultConfiguration: 'production',
      options: {
        main: 'test-project/src/main.ts',
        outputPath: 'dist/test-project',
        outputFileName: 'main.js',
        tsConfig: 'test-project/tsconfig.app.json',
        assets: [],
      },
      configurations: {
        development: {
          minify: false,
        },
        production: {
          minify: true,
        },
      },
    });

    expect(tree.exists('test-project/src/main.ts')).toBeTruthy();
    expect(tree.exists('test-project/tsconfig.json')).toBeTruthy();
    expect(tree.exists('test-project/tsconfig.app.json')).toBeTruthy();
  });

  it('should create a testable project', async () => {
    await appGenerator(tree, {
      name: 'test-project',
      directory: 'test-project',
      projectNameAndRootFormat: 'as-provided',
    });

    const projectConfiguration = readProjectConfiguration(tree, 'test-project');
    expect(projectConfiguration.targets['test']).toEqual<TargetConfiguration>({
      executor: '@nx/jest:jest',
      outputs: ['{workspaceRoot}/coverage/{projectRoot}'],
      options: {
        jestConfig: 'test-project/jest.config.ts',
        passWithNoTests: true,
      },
      configurations: {
        ci: {
          ci: true,
          codeCoverage: true,
        },
      },
    });

    expect(tree.exists('test-project/tsconfig.json')).toBeTruthy();
    expect(tree.exists('test-project/tsconfig.spec.json')).toBeTruthy();
    expect(tree.exists('test-project/jest.config.ts')).toBeTruthy();
    expect(tree.exists('test-project/src/main.spec.ts')).toBeTruthy();
  });

  it('should create a lintable project', async () => {
    await appGenerator(tree, {
      name: 'test-project',
      directory: 'test-project',
      projectNameAndRootFormat: 'as-provided',
    });

    const projectConfiguration = readProjectConfiguration(tree, 'test-project');
    expect(projectConfiguration.targets['lint']).toEqual<TargetConfiguration>({
      executor: '@nx/eslint:lint',
      outputs: ['{options.outputFile}'],
      options: {
        lintFilePatterns: ['test-project/**/*.ts'],
      },
    });

    expect(tree.exists('test-project/.eslintrc.json')).toBeTruthy();
  });
});
