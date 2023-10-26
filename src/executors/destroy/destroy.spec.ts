import {
  ExecutorContext,
  Tree,
  addProjectConfiguration,
  getProjects,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { destroyExecutor } from './destroy';
import * as child_process from 'node:child_process';

describe('destroy', () => {
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

  it('should execute cdk destroy', async () => {
    const execSpy = jest.spyOn(child_process, 'exec');

    await destroyExecutor({}, executorContext);

    expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
      '/virtual/node_modules/.bin/cdk destroy',
      expectedExecOptions
    );
  });

  describe('stacks', () => {
    it('should translate to argc', async () => {
      const execSpy = jest.spyOn(child_process, 'exec');

      await destroyExecutor(
        {
          stacks: '--all',
        },
        executorContext
      );

      expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
        '/virtual/node_modules/.bin/cdk destroy --all',
        expectedExecOptions
      );
    });
  });

  describe('app', () => {
    it('should translate to --app', async () => {
      const execSpy = jest.spyOn(child_process, 'exec');

      await destroyExecutor(
        {
          app: 'cdk.out/apps/test-app',
        },
        executorContext
      );

      expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
        '/virtual/node_modules/.bin/cdk destroy --app "../../cdk.out/apps/test-app"',
        expectedExecOptions
      );
    });
  });

  describe('force', () => {
    it('should translate to --force', async () => {
      const execSpy = jest.spyOn(child_process, 'exec');

      await destroyExecutor(
        {
          force: true,
        },
        executorContext
      );

      expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
        '/virtual/node_modules/.bin/cdk destroy --force',
        expectedExecOptions
      );
    });
  });
});
