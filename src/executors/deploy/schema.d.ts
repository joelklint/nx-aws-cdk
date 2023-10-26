export interface DeployExecutorSchema {
  stacks?: string;
  app?: string;
  hotswapFallback?: boolean;
  noRollback?: boolean;
}
