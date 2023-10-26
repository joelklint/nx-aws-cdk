import { Tree, readJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { initGenerator } from './init';

describe('init', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should install dependencies', async () => {
    await initGenerator(tree);

    const packageJson = readJson(tree, 'package.json');
    expect(packageJson.devDependencies['aws-cdk']).toEqual('^2.102.0');
    expect(packageJson.devDependencies['aws-cdk-lib']).toEqual('^2.102.0');
    expect(packageJson.devDependencies['constructs']).toEqual('^10.3.0');
    expect(packageJson.devDependencies['tsx']).toEqual('^3.14.0');
  });
});
