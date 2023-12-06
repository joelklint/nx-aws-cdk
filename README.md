# @nx-iac/aws-cdk

Empowers your [Nx](https://nx.dev) workspace with [AWS CDK](https://aws.amazon.com/cdk/) capabilities ⚡

What does it do?

- Generate AWS CDK projects
- Deploy AWS CDK projects
- Gives you total control of CLI arguments through `project.json`

## Table of contents

- [Install](#install)
  - [Dependencies](#dependencies)
- [Usage](#usage)
  - [Bootstrap AWS environment](#bootstrap-aws-environment)
  - [Generate AWS CDK project](#generate-aws-cdk-project)
    - [New application](#new-application)
    - [Preexisting application](#preexisting-application)
  - [Package application](#package-application)
  - [Deploy application](#deploy-application)
  - [Deploy application quickly](#deploy-application-quickly)
  - [Destroy application](#destroy-application)
- [Maintainer](#maintainer)
- [Thanks](#thanks)
- [Contributing](#contributing)
- [License](#license)

## Install

```sh
# npm
npm install --save-dev @nx-iac/aws-cdk

# yarn
yarn add --dev @nx-iac/aws-cdk

# pnpm
pnpm install --save-dev @nx-iac/aws-cdk
```

### Dependencies

The machine utilising this plugin must be authenticated with AWS. Read more about how authentication works [here](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_auth)

## Usage

### Bootstrap AWS environment

Prepare AWS environment for AWS CDK

```sh
nx g @nx-iac/aws-cdk:bootstrap
```

### Generate AWS CDK project

#### New application

Create a new application in your Nx workspace, with AWS CDK capabilities

```sh
nx g @nx-iac/aws-cdk:app
```

#### Preexisting application

Give AWS CDK capabilities to a preexisting project in your Nx workspace

```sh
nx g @nx-iac/aws-cdk:appify
```

### Package application

Create deployment artifacts for your AWS CDK project

⚠️ Beware of caching this output, since a target AWS environment could be encoded in it

```sh
nx package <app-name>
```

```sh
nx package <app-name> --context key1=value1 --contextSome key2=value2
```

### Deploy application

Deploy your AWS CDK project, creating cloud resources in AWS

```sh
nx deploy <app-name>
```

### Deploy application quickly

Deploy your AWS CDK project in the quickest way possible, shortening the feedback cycle during development

```sh
# once
nx run <app-name>:deploy:quick

# in watch mode
nx watch --includeDependentProjects --projects=<app-name> -- nx run <app-name>:deploy:quick
```

### Destroy application

Destroy your AWS CDK project, deleting cloud resources in AWS

```sh
nx destroy <app-name>
```

## Maintainer

[@joelklint](https://github.com/joelklint)

## Thanks

This plugin is inspired by [@adrian-goe](https://github.com/adrian-goe)'s
[nx-aws-cdk-v2](https://github.com/adrian-goe/nx-aws-cdk-v2).

## Contributing

Read [CONTRIBUTING.md](/CONTRIBUTING.md)!

## License

[MIT © Joel Klint](/LICENSE)
