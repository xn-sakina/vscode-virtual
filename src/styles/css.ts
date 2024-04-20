import { access, constants, readFile, rm, writeFile } from 'fs/promises'
import {
  EXTENSION_MARK,
  EXTENSION_NAME,
  EXTENSION_VERSION,
  LOCK_FILE_PATH,
} from '../constant'
import { lockFile } from '../utils/filelock'
import { getVscode } from '../utils/getVscode'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'
import { sudo } from '../utils/sudo'

export enum EUseVersion {
  /**
   * not installed
   */
  NONE = 0,
  /**
   * current usage version !== installed version
   */
  DIFF = 1,
  /**
   * current usage version === installed version
   */
  CUREENT = 2,
}

export class CSS {
  private filePath: string

  constructor(filePath: string) {
    this.filePath = filePath
  }

  getFilePath() {
    return this.filePath
  }

  async getCurrentUsageVersion() {
    const isInstall = await this.isInstalled()
    if (!isInstall) {
      return EUseVersion.NONE
    }

    const css = await this.getFileContent()

    const isDiff = !~css.indexOf(`/*${EXTENSION_MARK}.${EXTENSION_VERSION}*/`)

    if (isDiff) {
      return EUseVersion.DIFF
    }

    return EUseVersion.CUREENT
  }

  private async getFileContent() {
    const content = readFile(this.filePath, 'utf-8')
    return content
  }

  private async saveContentToTemp(content: string) {
    const filename = `vscode-virtual-extension-${randomUUID()}.css`
    const tempPath = join(tmpdir(), filename)
    await writeFile(tempPath, content, 'utf-8')
    return tempPath
  }

  async saveContent(content: string) {
    if (!content?.length) {
      return false
    }
    try {
      await access(this.filePath, constants.W_OK)
      await writeFile(this.filePath, content, 'utf-8')
      return true
    } catch (e: any) {
      const vscode = getVscode()
      if (!vscode) {
        return false
      }
      const retry = 'Retry with Admin/Sudo'
      const result = await vscode.window.showErrorMessage(e.message, retry)
      if (result !== retry) {
        return false
      }
      const tempFilePath = await this.saveContentToTemp(content)
      try {
        const mvcmd = process.platform === 'win32' ? 'move /Y' : 'mv -f'
        const cmdarg = `${mvcmd} "${tempFilePath}" "${this.filePath}"`
        await sudo(cmdarg, {
          name: `Visual Studio Code ${EXTENSION_NAME.toUpperCase()} Extension`,
        })
        return true
      } catch (e: any) {
        await vscode.window.showErrorMessage(e.message)
        return false
      } finally {
        await rm(tempFilePath)
      }
    }
  }

  async getContent() {
    return readFile(this.filePath, 'utf-8')
  }

  clearContent(content: string) {
    content = content.replace(
      /\/\*__vscode-virtual-extension-start__\*\/[\s\S]*?\/\*__vscode-virtual-extension-end__\*\//g,
      '',
    )
    content = content.replace(/\s*$/, '')
    return content
  }

  async isInstalled() {
    const content = await this.getFileContent()
    if (!content?.length) {
      return false
    }

    const hasMark = ~content.indexOf(EXTENSION_MARK)
    if (hasMark) {
      return true
    }
    return false
  }

  async uninstall() {
    let unlock = () => {}
    try {
      unlock = await lockFile(LOCK_FILE_PATH)
      let content = await this.getFileContent()
      content = this.clearContent(content)
      if (!content.trim().length) {
        return false
      }
      return this.saveContent(content)
    } catch (e) {
      console.log(e)
      return false
    } finally {
      await unlock?.()
    }
  }
}
