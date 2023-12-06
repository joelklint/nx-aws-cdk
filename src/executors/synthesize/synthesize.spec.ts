import {
  ExecutorContext,
  Tree,
  addProjectConfiguration,
  getProjects,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { synthesizeExecutor } from './synthesize';
import * as fs from 'node:fs';
import * as child_process from 'node:child_process';

describe('synthesize', () => {
  let tree: Tree;
  let executorContext: ExecutorContext;
  let expectedExecOptions: child_process.ExecOptions;
  const rmSpy = jest.spyOn(fs, 'rmSync');

  beforeEach(() => {
    jest.clearAllMocks();
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
    rmSpy.mockImplementation(() => undefined);
  });

  it('should delete the output directory', async () => {
    await synthesizeExecutor(
      {
        output: 'cdk.out/apps/test-app',
      },
      executorContext
    );

    expect(rmSpy).toHaveBeenCalledWith<[fs.PathLike, fs.RmOptions]>(
      'cdk.out/apps/test-app',
      {
        recursive: true,
        force: true,
      }
    );
  });

  it('should execute cdk synthesize', async () => {
    const execSpy = jest.spyOn(child_process, 'exec');

    await synthesizeExecutor(
      {
        output: 'cdk.out/apps/test-app',
      },
      executorContext
    );

    expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
      '/virtual/node_modules/.bin/cdk synthesize --output ../../cdk.out/apps/test-app',
      expectedExecOptions
    );
  });

  describe('stacks', () => {
    it('should translate to argv', async () => {
      const execSpy = jest.spyOn(child_process, 'exec');

      await synthesizeExecutor(
        {
          output: 'cdk.out/apps/test-app',
          stacks: 'some-stack',
        },
        executorContext
      );

      expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
        '/virtual/node_modules/.bin/cdk synthesize some-stack --output ../../cdk.out/apps/test-app',
        expectedExecOptions
      );
    });
  });

  describe('quiet', () => {
    it('should translate to --quiet', async () => {
      const execSpy = jest.spyOn(child_process, 'exec');

      await synthesizeExecutor(
        {
          output: 'cdk.out/apps/test-app',
          quiet: true,
        },
        executorContext
      );

      expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
        '/virtual/node_modules/.bin/cdk synthesize --quiet --output ../../cdk.out/apps/test-app',
        expectedExecOptions
      );
    });
  });

  describe('context', () => {
    it('should translate single value to single --context', async () => {
      const execSpy = jest.spyOn(child_process, 'exec');

      await synthesizeExecutor(
        {
          output: 'cdk.out/apps/test-app',
          context: ['first=1'],
        },
        executorContext
      );

      expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
        '/virtual/node_modules/.bin/cdk synthesize --output ../../cdk.out/apps/test-app --context first=1',
        expectedExecOptions
      );
    });

    it('should translate multiple values to multiple --context', async () => {
      const execSpy = jest.spyOn(child_process, 'exec');

      await synthesizeExecutor(
        {
          output: 'cdk.out/apps/test-app',
          context: ['second=2', 'random=value'],
        },
        executorContext
      );

      expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
        '/virtual/node_modules/.bin/cdk synthesize --output ../../cdk.out/apps/test-app --context second=2 --context random=value',
        expectedExecOptions
      );
    });
  });
});
