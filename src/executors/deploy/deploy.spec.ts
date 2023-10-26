import {
  ExecutorContext,
  Tree,
  addProjectConfiguration,
  getProjects,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import * as child_process from 'node:child_process';
import { deployExecutor } from './deploy';

describe('deploy', () => {
  let tree: Tree;
  let executorContext: ExecutorContext;
  let expectedExecOptions: child_process.ExecOptions;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, 'test-project', {
      root: 'apps/test-project',
    });
    executorContext = {
      root: '/virtual',
      cwd: '/virtual',
      projectName: 'test-project',
      isVerbose: false,
      projectsConfigurations: {
        version: -1,
        projects: Object.fromEntries(getProjects(tree)),
      },
    };
    expectedExecOptions = {
      cwd: '/virtual/apps/test-project',
      maxBuffer: 1024000000,
    };
    jest.clearAllMocks();
  });

  it('should execute cdk deploy', async () => {
    const execSpy = jest.spyOn(child_process, 'exec');

    await deployExecutor({}, executorContext);

    expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
      '/virtual/node_modules/.bin/cdk deploy',
      expectedExecOptions
    );
  });

  describe('stacks', () => {
    it('should translate to argv', async () => {
      const execSpy = jest.spyOn(child_process, 'exec');

      await deployExecutor(
        {
          stacks: '*',
        },
        executorContext
      );

      expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
        '/virtual/node_modules/.bin/cdk deploy *',
        expectedExecOptions
      );
    });
  });

  describe('app', () => {
    it('should translate to --app', async () => {
      const execSpy = jest.spyOn(child_process, 'exec');

      await deployExecutor(
        {
          app: 'cdk.out/apps/test-app',
        },
        executorContext
      );

      expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
        '/virtual/node_modules/.bin/cdk deploy --app "../../cdk.out/apps/test-app"',
        expectedExecOptions
      );
    });
  });

  describe('hotswapFallback', () => {
    it('should translate to --hotswap-fallback', async () => {
      const execSpy = jest.spyOn(child_process, 'exec');

      await deployExecutor(
        {
          hotswapFallback: true,
        },
        executorContext
      );

      expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
        '/virtual/node_modules/.bin/cdk deploy --hotswap-fallback',
        expectedExecOptions
      );
    });
  });

  describe('noRollback', () => {
    it('should translate to --no-rollback', async () => {
      const execSpy = jest.spyOn(child_process, 'exec');

      await deployExecutor(
        {
          noRollback: true,
        },
        executorContext
      );

      expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
        '/virtual/node_modules/.bin/cdk deploy --no-rollback',
        expectedExecOptions
      );
    });
  });
});
