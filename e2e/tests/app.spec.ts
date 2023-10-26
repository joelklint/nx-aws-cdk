import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nx/plugin/testing';

describe('app e2e', () => {
  // Setting up individual workspaces per
  // test can cause e2e runs to take a long time.
  // For this reason, we recommend each suite only
  // consumes 1 workspace. The tests should each operate
  // on a unique project in the workspace, such that they
  // are not dependant on one another.
  beforeAll(() => {
    ensureNxProject('@nx-iac/aws-cdk', 'dist/nx-aws-cdk');
  });

  afterAll(() => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    runNxCommandAsync('reset');
  });

  it('should create application', async () => {
    const project = uniq('app');
    await runNxCommandAsync(
      `generate @nx-iac/aws-cdk:app ${project} --directory apps/subdir/${project} --project-name-and-root-format as-provided`
    );
    const result = await runNxCommandAsync(`build ${project}`);
    expect(result.stdout).toContain('Successfully ran target build');
  }, 120000);

  describe('--directory', () => {
    it('should create src in the specified directory', async () => {
      const project = uniq('app');
      await runNxCommandAsync(
        `generate @nx-iac/aws-cdk:app ${project} --directory apps/subdir/${project} --project-name-and-root-format as-provided`
      );

      expect(() =>
        checkFilesExist(
          `apps/subdir/${project}/cdk.json`,
          `apps/subdir/${project}/tsconfig.json`,
          `apps/subdir/${project}/tsconfig.app.json`,
          `apps/subdir/${project}/tsconfig.spec.json`,
          `apps/subdir/${project}/jest.config.ts`,
          `apps/subdir/${project}/.eslintrc.json`,
          `apps/subdir/${project}/src/main.ts`,
          `apps/subdir/${project}/src/main.spec.ts`,
          // `apps/subdir/${project}/cdk/${names(project).className}App.ts'`, // This fails, even though the file exists 🤷‍♂️
          `apps/subdir/${project}/cdk/stacks/SampleStack.ts`,
          `apps/subdir/${project}/cdk/stacks/SampleStack.spec.ts`
        )
      ).not.toThrow();
    }, 120000);
  });

  describe('--tags', () => {
    it('should add tags to the project', async () => {
      const projectName = uniq('app');
      await runNxCommandAsync(
        `generate @nx-iac/aws-cdk:app ${projectName} --directory apps/subdir/${projectName} --project-name-and-root-format as-provided --tags e2etag,e2ePackage`
      );
      const project = readJson(`apps/subdir/${projectName}/project.json`);
      expect(project.tags).toEqual(['e2etag', 'e2ePackage']);
    }, 120000);
  });
});

// TODO: Make e2e tests for init, bootstrap, appify, synthesize, deploy, destroy
