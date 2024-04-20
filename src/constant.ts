import { join } from 'path'
import pkgContent from '../package.json'
import { IExtensionConfig, IPkg } from './interface'

const pkg = pkgContent as IPkg

export const EXTENSION_NAME = pkg.name
export const EXTENSION_VERSION = pkg.version
export const PUBLISHER = pkg.publisher
export const EXTENSION_ID = `${PUBLISHER}.${EXTENSION_NAME}`

export const EXTENSION_MARK = `__${EXTENSION_NAME}-mark__`
export const LOCK_FILE_PATH = join(__dirname, `../${EXTENSION_ID}.lock`)
export const CACHE_FILE_PATH = join(__dirname, `../${EXTENSION_ID}.cache`)

export const DEFAULT_CONFIG: IExtensionConfig = {
  styles: [],
}
