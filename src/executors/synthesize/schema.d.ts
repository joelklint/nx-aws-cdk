export interface SynthesizeExecutorSchema {
  output: string;
  stacks?: string;
  quiet?: boolean;
  context?: string[] | string;
}
