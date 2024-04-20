import { WorkspaceConfiguration } from 'vscode'

export interface IPkg {
  name: string
  version: string
  publisher: string
}

export interface IExtensionConfig {
  enabled?: boolean
  styles?: string[]
}

export interface IConfig extends WorkspaceConfiguration, IExtensionConfig {}
