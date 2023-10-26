import {
  TargetConfiguration,
  Tree,
  addProjectConfiguration,
  readProjectConfiguration,
  workspaceRoot,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { appifyGenerator } from './appify';
import { runCdkCommand } from '../../utils/shell';
import { mkdir, readFile, rm } from 'fs/promises';
import { join } from 'path';
import { CDK_VERSION } from '../init/init';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import { buildCdkGenericCommand } from '../../utils/cdkCommandBuilder';

describe('appify', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should create project targets', async () => {
    addProjectConfiguration(tree, 'test-project', {
      root: 'test-project',
    });

    await appifyGenerator(tree, {
      project: 'test-project',
    });

    const projectConfiguration = readProjectConfiguration(tree, 'test-project');
    expect(
      projectConfiguration.targets['package']
    ).toEqual<TargetConfiguration>({
      executor: '@nx-iac/aws-cdk:synthesize',
      dependsOn: ['build'],
      outputs: ['{options.output}'],
      options: {
        output: `cdk.out/test-project`,
        quiet: true
      },
    });
    expect(projectConfiguration.targets['deploy']).toEqual<TargetConfiguration>(
      {
        executor: '@nx-iac/aws-cdk:deploy',
        dependsOn: ['package'],
        defaultConfiguration: 'normal',
        options: {
          app: `cdk.out/test-project`,
          stacks: '--all',
        },
        configurations: {
          normal: {},
          quick: {
            hotswapFallback: true,
            noRollback: true,
          },
        },
      }
    );
    expect(
      projectConfiguration.targets['destroy']
    ).toEqual<TargetConfiguration>({
      executor: '@nx-iac/aws-cdk:destroy',
      dependsOn: ['package'],
      options: {
        app: `cdk.out/test-project`,
        stacks: '--all',
        force: true,
      },
    });
  });

  it('should create a sample cdk project', async () => {
    addProjectConfiguration(tree, 'test-project', {
      root: 'apps/test-project',
    });

    await appifyGenerator(tree, {
      project: 'test-project',
    });

    expect(tree.exists('apps/test-project/cdk/TestProjectApp.ts')).toBeTruthy();
    expect(
      tree.exists('apps/test-project/cdk/stacks/SampleStack.ts')
    ).toBeTruthy();
    expect(
      tree.exists('apps/test-project/cdk/stacks/SampleStack.spec.ts')
    ).toBeTruthy();
    expect(tree.exists('apps/test-project/cdk.json')).toBeTruthy();
    expect(
      JSON.parse(tree.read('apps/test-project/cdk.json', 'utf-8'))
    ).toEqual({
      app: '../../node_modules/.bin/tsx cdk/TestProjectApp.ts',
      requireApproval: 'never',
      context: {
        '@aws-cdk/aws-lambda:recognizeLayerVersion': true,
        '@aws-cdk/core:checkSecretUsage': true,
        '@aws-cdk/core:target-partitions': ['aws', 'aws-cn'],
        '@aws-cdk-containers/ecs-service-extensions:enableDefaultLogDriver':
          true,
        '@aws-cdk/aws-ec2:uniqueImdsv2TemplateName': true,
        '@aws-cdk/aws-ecs:arnFormatIncludesClusterName': true,
        '@aws-cdk/aws-iam:minimizePolicies': true,
        '@aws-cdk/core:validateSnapshotRemovalPolicy': true,
        '@aws-cdk/aws-codepipeline:crossAccountKeyAliasStackSafeResourceName':
          true,
        '@aws-cdk/aws-s3:createDefaultLoggingPolicy': true,
        '@aws-cdk/aws-sns-subscriptions:restrictSqsDescryption': true,
        '@aws-cdk/aws-apigateway:disableCloudWatchRole': true,
        '@aws-cdk/core:enablePartitionLiterals': true,
        '@aws-cdk/aws-events:eventsTargetQueueSameAccount': true,
        '@aws-cdk/aws-iam:standardizedServicePrincipals': true,
        '@aws-cdk/aws-ecs:disableExplicitDeploymentControllerForCircuitBreaker':
          true,
        '@aws-cdk/aws-iam:importedRoleStackSafeDefaultPolicyName': true,
        '@aws-cdk/aws-s3:serverAccessLogsUseBucketPolicy': true,
        '@aws-cdk/aws-route53-patters:useCertificate': true,
        '@aws-cdk/customresources:installLatestAwsSdkDefault': false,
        '@aws-cdk/aws-rds:databaseProxyUniqueResourceName': true,
        '@aws-cdk/aws-codedeploy:removeAlarmsFromDeploymentGroup': true,
        '@aws-cdk/aws-apigateway:authorizerChangeDeploymentLogicalId': true,
        '@aws-cdk/aws-ec2:launchTemplateDefaultUserData': true,
        '@aws-cdk/aws-secretsmanager:useAttachedSecretResourcePolicyForSecretTargetAttachments':
          true,
        '@aws-cdk/aws-redshift:columnId': true,
        '@aws-cdk/aws-stepfunctions-tasks:enableEmrServicePolicyV2': true,
        '@aws-cdk/aws-ec2:restrictDefaultSecurityGroup': true,
        '@aws-cdk/aws-apigateway:requestValidatorUniqueId': true,
        '@aws-cdk/aws-kms:aliasNameRef': true,
        '@aws-cdk/aws-autoscaling:generateLaunchTemplateInsteadOfLaunchConfig':
          true,
        '@aws-cdk/core:includePrefixInUniqueNameGeneration': true,
        '@aws-cdk/aws-efs:denyAnonymousAccess': true,
        '@aws-cdk/aws-opensearchservice:enableOpensearchMultiAzWithStandby':
          true,
        '@aws-cdk/aws-lambda-nodejs:useLatestRuntimeVersion': true,
        '@aws-cdk/aws-efs:mountTargetOrderInsensitiveLogicalId': true,
        '@aws-cdk/aws-rds:auroraClusterChangeScopeOfInstanceParameterGroupWithEachParameters':
          true,
        '@aws-cdk/aws-appsync:useArnForSourceApiAssociationIdentifier': true,
        '@aws-cdk/aws-rds:preventRenderingDeprecatedCredentials': true,
      },
    });
  });

  it('should create a cdk.json which matches the one from "cdk init"', async () => {
    const tmpPath = join(tmpdir(), uuidv4());
    try {
      mkdir(tmpPath);
      const packageJson = await readFile(
        join(workspaceRoot, 'package.json'),
        'utf-8'
      ).then((res) => Promise.resolve(JSON.parse(res)));
      expect(packageJson['devDependencies']['aws-cdk']).toEqual(CDK_VERSION); // Verify we match the cdk command actually used by our generators/executors

      const command = buildCdkGenericCommand({
        workspaceRoot,
        args: ['init', 'app', '--language=typescript', '--generate-only'],
      });

      await runCdkCommand({
        workDir: tmpPath,
        command,
      });

      const generatedCdkJson = await readFile(
        join(tmpPath, 'cdk.json'),
        'utf-8'
      ).then((res) => Promise.resolve(JSON.parse(res)));

      const desiredCdkJson = {
        app: '<%= cdkApp %>',
        requireApproval: 'never',
        context: generatedCdkJson['context'], // We want to use the context value provided by aws cdk cli
      };

      const actualCdkJson = await readFile(
        join(__dirname, 'files', 'cdk.json__tmpl__'),
        'utf-8'
      ).then((res) => Promise.resolve(JSON.parse(res)));

      expect(desiredCdkJson).toEqual(actualCdkJson);
    } finally {
      rm(tmpPath, {
        recursive: true,
        force: false,
      });
    }
  });
});
