import { exec } from 'node:child_process';

interface CdkCommandRequest {
  workDir: string;
  command: string;
}

export function runCdkCommand(request: CdkCommandRequest): Promise<boolean> {
  const { workDir, command } = request;
  return new Promise((resolve) => {
    // logger.debug(output.dim(`Executing '${command}'`));

    const childProcess = exec(command, {
      maxBuffer: 1024 * 1000000,
      cwd: workDir,
    });

    // Ensure the child process is killed when the parent exits
    const processExitListener = () => childProcess.kill();
    process.on('exit', processExitListener);
    process.on('SIGTERM', processExitListener);

    process.stdin.on('data', (data) => {
      childProcess.stdin.write(data);
      // childProcess.stdin.end();
    });

    childProcess.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    childProcess.stderr.on('data', (err) => {
      process.stderr.write(err);
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        resolve(false);
      }

      process.removeListener('exit', processExitListener);

      process.stdin.end();
      process.stdin.removeListener('data', processExitListener);
    });
  });
}
