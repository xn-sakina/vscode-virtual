import lockfile from 'lockfile'

export async function lockFile(filePath: string) {
  const lock = () =>
    new Promise<void>((resolve, reject) => {
      lockfile.lock(
        filePath,
        {
          wait: 5 * 1e3,
        },
        (err) => {
          if (err) {
            return reject(err)
          }
          resolve()
        },
      )
    })
  await lock()
  const unlock = () =>
    new Promise<void>((resolve, reject) => {
      lockfile.unlock(filePath, (err) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  return unlock
}
