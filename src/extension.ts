import vscode from 'vscode'
import { tips } from './utils/tips'
import { EXTENSION_ID, EXTENSION_VERSION } from './constant'
import { Styles } from './styles'

const pluginName = `vscode-virtual`

export async function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'extension.vscode-virtual.info',
    function () {
      tips.showInfo(`Welcome to use vscode-virtual@${EXTENSION_VERSION}!`)
    },
  )
  context.subscriptions.push(disposable)

  const styles = new Styles()
  await styles.setup()
  context.subscriptions.push(styles)

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'extension.vscode-virtual.reload',
      async () => {
        const isInstall = await styles.isInstalled()
        if (!isInstall) {
          return
        }

        await styles.reload()
      },
    ),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'extension.vscode-virtual.uninstall',
      async () => {
        const isInstall = await styles.isInstalled()
        if (!isInstall) {
          return
        }

        const isUninstallSuccess = await styles.uninstall()
        if (isUninstallSuccess) {
          await vscode.commands.executeCommand(
            'workbench.extensions.uninstallExtension',
            EXTENSION_ID,
          )
          await tips.showInfoRestart(
            `${pluginName} extension has been uninstalled. See you next time!`,
          )
        }
      },
    ),
  )
}

export function deactivate() {}
