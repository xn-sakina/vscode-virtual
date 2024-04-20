import { existsSync } from 'fs'
import { getVscodeCssFile } from '../utils/getVscodeCssFile'
import { CSS, EUseVersion } from './css'
import { CACHE_FILE_PATH, EXTENSION_VERSION, LOCK_FILE_PATH } from '../constant'
import vscode, { Disposable } from 'vscode'
import { writeFile } from 'fs/promises'
import { IConfig } from '../interface'
import { isEqual, trim } from 'lodash'
import { tips } from '../utils/tips'
import { lockFile } from '../utils/filelock'
import { CssCreator } from './cssCreator'
import { sleep } from '../utils/sleep'

interface ICache {
  version: string
  cssPath: string
}

export class Styles implements Disposable {
  private css!: CSS
  private disposables: Disposable[] = []
  private cacheConfig: IConfig

  constructor() {
    this.cacheConfig = this.getConfig()
  }

  private getConfig() {
    const config = vscode.workspace.getConfiguration(
      'vscode-virtual',
    ) as IConfig
    return config
  }

  private async writeCahceFile() {
    const cache: ICache = {
      version: EXTENSION_VERSION,
      cssPath: this.css.getFilePath(),
    }
    await writeFile(CACHE_FILE_PATH, JSON.stringify(cache, null, 2), 'utf-8')
  }

  private async isFirstInstall(): Promise<boolean> {
    const hasCacheFile = existsSync(CACHE_FILE_PATH)

    if (!hasCacheFile) {
      vscode.commands.executeCommand('extension.vscode-virtual.info')
      await this.writeCahceFile()
      return true
    }

    return false
  }

  async setup(): Promise<void> {
    tips.showDebug('setup')
    const vscodeCssFilePath = getVscodeCssFile()
    tips.showDebug('vscodeCssFilePath: ', vscodeCssFilePath)
    this.css = new CSS(vscodeCssFilePath)

    const isFirstLoad = await this.isFirstInstall()
    tips.showDebug('isFirstLoad: ', isFirstLoad)

    const currentUsageVersion = await this.css.getCurrentUsageVersion()
    tips.showDebug('currentUsageVersion: ', currentUsageVersion)

    if (
      isFirstLoad ||
      [EUseVersion.DIFF, EUseVersion.NONE].includes(currentUsageVersion)
    ) {
      await this.install(true)
    }

    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration(async () => {
        tips.showDebug('onDidChangeConfiguration')
        await sleep(~~(Math.random() * 500))
        this.install()
      }),
    )
  }

  async reload() {
    const isInstall = await this.isInstalled()
    if (!isInstall) {
      return
    }
    tips.showDebug('reload')
    return this.install(true)
  }

  private async install(forceUpdate = false): Promise<void> {
    const cacheConfig = this.cacheConfig
    const currentUsageConfig = this.getConfig()
    tips.showDebug(
      'cacheConfig: ',
      cacheConfig,
      'currentUsageConfig: ',
      currentUsageConfig,
    )

    if (!forceUpdate) {
      const cacheConfigString = JSON.stringify(cacheConfig)
      const currentUsageConfigString = JSON.stringify(currentUsageConfig)
      tips.showDebug(
        'cacheConfigString: ',
        cacheConfigString,
        'currentUsageConfigString: ',
        currentUsageConfigString,
      )
      if (isEqual(cacheConfigString, currentUsageConfigString)) {
        // console.log(`config is not changed`)
        return
      }
    }

    if (!cacheConfig?.enabled && !cacheConfig?.enabled) {
      return
    }

    // update cache
    this.cacheConfig = currentUsageConfig

    const willUninstall = !currentUsageConfig?.enabled
    if (willUninstall) {
      await this.uninstall()
      tips.showInfoRestart(
        'VSCode Virtual has been uninstalled! Please restart.',
      )
      return
    }

    let unlock: () => Promise<void> = async () => {}
    try {
      unlock = await lockFile(LOCK_FILE_PATH)

      const content = await CssCreator.createCSS(currentUsageConfig)
      tips.showDebug('content: ', content)

      let cssContent = await this.css.getContent()
      cssContent = this.css.clearContent(cssContent)
      cssContent = trim(cssContent)
      if (!cssContent?.length) {
        return
      }
      cssContent += content

      const isSaveSuccess = await this.css.saveContent(cssContent)
      if (isSaveSuccess) {
        tips.showInfoRestart('VSCode Virtual has been changed! Please restart.')
      }
    } finally {
      await unlock()
    }
  }

  async isInstalled() {
    return this.css.isInstalled()
  }

  async uninstall() {
    return this.css.uninstall()
  }

  dispose(): void {
    this.disposables.forEach((d) => {
      d.dispose()
    })
  }
}
