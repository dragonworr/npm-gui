import spawn from 'cross-spawn';

import { ZERO } from '../utils/utils';

// const Console = {
//   send(...arguments_: any[]) {
//     arguments_;
//   },
// };

export const executeCommand = (
  cwd: string | undefined,
  wholeCommand: string,
): Promise<{ stdout: string; stderr: string }> => {
  console.log(`Command: ${cwd ?? ''} ${wholeCommand}, started:`);
  return new Promise((resolve, reject) => {
    // spawn process
    const commandArguments = wholeCommand.split(' ');
    const command = commandArguments.shift();
    if (command === undefined) {
      reject(new Error('command not passed'));
    } else {
      const spawned = spawn(command, commandArguments, {
        cwd,
        detached: false,
      });
      // const commandId = Date.now().toString();
      // console.log(`executing: "${wholeCommand}" in "${cwd}"\n`, commandId);
      // if (pushToConsole) {
      //   Console.send(
      //     `executing: "${wholeCommand}" in "${cwd ?? 'global'}"\n`,
      //     commandId,
      //   );
      // }

      // wait for stdout, stderr
      let stdout = '';
      spawned.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
        // send part data through socket if required
        // if (pushToConsole) {
        //   Console.send(data.toString(), commandId);
        // }
      });

      let stderr = '';
      spawned.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
        // TODO send as stderr and show red color
        // if (pushToConsole) {
        //   Console.send(data.toString(), commandId);
        // }
      });

      // wait for finish and resolve
      spawned.on('close', (exitStatus: number) => {
        console.log(exitStatus);
        if (exitStatus === ZERO) {
          resolve({
            stdout,
            stderr,
          });
        } else {
          reject(stdout + stderr);
        }
        // if (pushToConsole) {
        //   Console.send('', commandId, exitStatus === 0 ? 'CLOSE' : 'ERROR');
        // }
        // resolve({
        //   stdout,
        //   stderr,
        // });
      });

      // if error
      spawned.on('error', () => {
        // if (pushToConsole) {
        //   Console.send('', commandId, 'ERROR');
        // }
        reject(new Error(stderr));
      });
    }
  });
};

export const executeCommandSimple = async (
  cwd: string | undefined,
  wholeCommand: string,
): Promise<string> => {
  const { stdout } = await executeCommand(cwd, wholeCommand);
  return stdout;
};

// eslint-disable-next-line func-style
export async function executeCommandJSONWithFallback<T>(
  cwd: string | undefined,
  wholeCommand: string,
): Promise<T> {
  try {
    const { stdout } = await executeCommand(cwd, wholeCommand);
    console.log('OK:');
    return stdout ? (JSON.parse(stdout) as T) : ({} as T);
  } catch (error: unknown) {
    console.log('ERROR:', error);
    return JSON.parse(
      (error as string).replace(/(\n{[\S\s]+)?npm ERR[\S\s]+/gm, ''),
    ) as T;
  }
}

// eslint-disable-next-line func-style, max-statements
export async function executeCommandJSONWithFallbackYarn<T>(
  cwd: string | undefined,
  wholeCommand: string,
): Promise<T | undefined> {
  try {
    const { stdout, stderr } = await executeCommand(cwd, wholeCommand);
    console.log('OK:');
    const JSONs = (stdout + stderr)
      .trim()
      .split('\n')
      .filter((x) => x)
      .map((r) => JSON.parse(r));
    const table = JSONs.find((x) => 'type' in x && x.type === 'table') as
      | T
      | undefined;
    if (table) {
      return table;
    }

    const anyError = JSONs.find((x) => 'type' in x && x.type === 'error') as
      | T
      | undefined;
    if (anyError) {
      return anyError;
    }
  } catch (error: unknown) {
    console.log('ERROR:');

    if (typeof error === 'string') {
      const JSONs = error
        .trim()
        .split('\n')
        .filter((x) => x)
        .map((r) => JSON.parse(r));
      const table = JSONs.find((x) => 'type' in x && x.type === 'table') as
        | T
        | undefined;
      if (table) {
        return table;
      }

      const anyError = JSONs.find((x) => 'type' in x && x.type === 'error') as
        | T
        | undefined;
      if (anyError) {
        return anyError;
      }
    }

    return JSON.parse(error as string) as T;
  }

  return undefined;
}