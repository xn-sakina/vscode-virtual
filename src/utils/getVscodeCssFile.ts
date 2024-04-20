import { dirname, join } from 'path'
import vscode from 'vscode'
import { tips } from './tips'

enum EPlatform {
  desktop = 'desktop',
  web = 'web',
}

export const getVscodeCssFile = () => {
  tips.showDebug('require.main: ', require.main)
  const mainFilename = require.main!.filename
  const vscodeInstallPath = vscode.env.appRoot
  tips.showDebug('vscodeInstallPath: ', vscodeInstallPath)
  const base = mainFilename?.length
    ? dirname(require.main!.filename)
    : join(vscodeInstallPath, 'out')
  tips.showDebug('base: ', base)

  const cssName = `workbench.${EPlatform.desktop}.main.css`
  // https://github.com/microsoft/vscode/pull/141263
  const webCssName = `workbench.${EPlatform.web}.main.css`

  const getCssPath = (cssFileName: string) =>
    join(base, 'vs', 'workbench', cssFileName)

  const defPath = getCssPath(cssName)
  const webPath = getCssPath(webCssName)
  tips.showDebug('css path: ', defPath, webPath)

  // See https://code.visualstudio.com/api/references/vscode-api#env
  switch (vscode?.env.appHost) {
    case EPlatform.desktop:
      return defPath
    case EPlatform.web:
    default:
      return webPath
  }
}
