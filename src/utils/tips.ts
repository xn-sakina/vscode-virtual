import vscode from 'vscode'

export const tips = {
  showDebug(...args: any[]) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG]`, ...args)
    }
  },
  showInfo(content: string) {
    return vscode.window.showInformationMessage(content)
  },
  showError(content: string) {
    return vscode.window.showErrorMessage(content)
  },
  showInfoRestart(content: string) {
    return vscode.window
      .showInformationMessage(content, { title: 'Restart vscode' })
      .then(function (item) {
        if (!item) return
        vscode.commands.executeCommand('workbench.action.reloadWindow')
      })
  },
}
