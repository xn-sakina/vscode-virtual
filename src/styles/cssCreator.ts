import * as stylis from 'stylis'
import { IConfig } from '../interface'
import axios from 'axios'
import { trim } from 'lodash'
import { DEFAULT_CONFIG, EXTENSION_MARK, EXTENSION_VERSION } from '../constant'
import { tips } from '../utils/tips'
import { existsSync } from 'fs'
import { readFile } from 'fs/promises'

enum EProtocol {
  file = 'file://',
  vscodeFile = 'vscode-file://vscode-app',
  http = 'http://',
  https = 'https://',
}

interface ICss {
  content: string
  url: `${EProtocol}${string}`
}

const EMPTY_CSS: ICss = {
  content: '',
  url: '' as any,
}

export class CssCreator {
  constructor() {}

  private async getCssFromLocalFile(filepath: string) {
    if (!filepath?.length) {
      return
    }
    try {
      if (!existsSync(filepath)) {
        throw new Error(
          `The file does not exist.`,
        )
      }
      const content = await readFile(filepath, 'utf-8')
      // make sure the content is string
      if (typeof content !== 'string') {
        throw new Error(`The file content is not a string.`)
      }
      return content
    } catch (e: any) {
      tips.showError(
        `The file '${filepath}' read failed: ${e.message || 'Unknown error'}`,
      )
    }
  }

  private async getCssFromHttp(url: string) {
    try {
      const res = await axios.get(url)
      const text = res.data
      if (typeof text !== 'string') {
        throw new Error(`The response is not a string.`)
      }
      return text as string
    } catch (e: any) {
      const errorMsg = e.message || 'Unknown error'
      const error = `The request to '${url}' failed: ${errorMsg}`
      tips.showError(error)
    }
  }

  private async generateCSS(config: IConfig) {
    const { styles = [] } = Object.assign({}, DEFAULT_CONFIG, config)
    const urls = styles
      .map((url) => {
        return trim(url)
      })
      .filter(Boolean)
      .filter((style) => {
        // filter protocol
        const isStartWithFile = style.startsWith(EProtocol.file)
        if (isStartWithFile) {
          return true
        }
        const isStartWithHttp =
          style.startsWith(EProtocol.http) || style.startsWith(EProtocol.https)
        if (isStartWithHttp) {
          return true
        }
        return false
      })
    const tasks = urls.map(async (url) => {
      const isHttp =
        url.startsWith(EProtocol.http) || url.startsWith(EProtocol.https)
      if (isHttp) {
        const content = await this.getCssFromHttp(url)
        if (!content?.length) {
          return EMPTY_CSS
        }
        const css: ICss = {
          content: trim(content),
          url: url as ICss['url'],
        }
        return css
      }
      const isFile = url.startsWith(EProtocol.file)
      if (isFile) {
        const filepath = url.slice(EProtocol.file.length)
        const content = await this.getCssFromLocalFile(filepath)
        if (!content) {
          return EMPTY_CSS
        }
        const css: ICss = {
          content: trim(content),
          url: url as ICss['url'],
        }
        return css
      }
      return
    })
    const cssContents = await Promise.all(tasks)
    const filteredCssContents = cssContents.filter((i) => {
      return i?.content?.length
    }) as ICss[]
    const allCssContent = filteredCssContents.map(i => i.content).join('\n')
    return trim(allCssContent)
  }

  private compile(content: string) {
    if (!content?.length) {
      return ''
    }

    // replace all `file://` to `vscode-file://vscode-app`
    // for load local image in vscode
    if (content.includes(EProtocol.file)) {
      content = content.replaceAll(
        `'${EProtocol.file}`,
        `'${EProtocol.vscodeFile}`,
      )
      content = content.replaceAll(
        `"${EProtocol.file}`,
        `"${EProtocol.vscodeFile}`,
      )
    }

    return stylis.serialize(stylis.compile(content), stylis.stringify)
  }

  private withMark(content: string) {
    return '\n' + `
/*__vscode-virtual-extension-start__*/
/*${EXTENSION_MARK}.${EXTENSION_VERSION}*/
${content}
/*__vscode-virtual-extension-end__*/
`.trimStart()
  }

  static async createCSS(config: IConfig) {
    const ins = new CssCreator()
    const allCssContent = await ins.generateCSS(config)
    tips.showDebug('allCssContent: ', allCssContent)
    const compiled = ins.compile(allCssContent)
    const result = trim(ins.withMark(compiled))
    return result
  }
}
