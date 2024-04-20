import sudoPrompt from '@vscode/sudo-prompt'

interface ISudoOptions {
  name?: string
}

interface ISudoResult {
  stdout?: string | Buffer
  stderr?: string | Buffer
}

export function sudo(cmd: string, options: ISudoOptions = {}) {
  return new Promise<ISudoResult>((resolve, reject) => {
    sudoPrompt.exec(
      cmd,
      options,
      (error?: Error, stdout?: string | Buffer, stderr?: string | Buffer) => {
        if (error) {
          reject(error)
        }
        resolve({ stdout, stderr })
      },
    )
  })
}
