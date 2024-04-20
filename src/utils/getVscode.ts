import { tips } from './tips'

export const getVscode = () => {
  try {
    const path = require('vscode') as typeof import('vscode')
    tips.showDebug('vscode loaded: ', path)
    return path
  } catch {
    return
  }
}
