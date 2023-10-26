import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { bootstrapGenerator } from './bootstrap';
import * as child_process from 'node:child_process';

describe('bootstrap', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run cdk bootstrap command', async () => {
    const execSpy = jest.spyOn(child_process, 'exec');

    await bootstrapGenerator(tree, {
      accountId: 123,
      region: 'eu-west-1',
    });

    expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
      '/virtual/node_modules/.bin/cdk bootstrap 123/eu-west-1',
      {
        cwd: tree.root,
        maxBuffer: 1024000000,
      }
    );
  });
});
