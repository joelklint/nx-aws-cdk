import { ProjectNameAndRootFormat } from '@nx/devkit/src/generators/project-name-and-root-utils';

export interface AppGeneratorSchema {
  name: string;
  directory?: string;
  projectNameAndRootFormat?: ProjectNameAndRootFormat;
  tags?: string;
}
