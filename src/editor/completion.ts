import * as vscode from 'vscode'
import { Global, KeyDetector } from '../core'
import { ExtensionModule } from '../modules'
import { LanguageSelectors } from '../meta'

class CompletionProvider implements vscode.CompletionItemProvider {
  public provideCompletionItems (
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    if (!Global.enabled)
      return

    let key = KeyDetector.getKey(document, position)
    if (!key || !/\.$/.test(key))
      return

    key = key.slice(0, -1)
    const trans = Global.loader.getTreeNodeByKey(key)

    if (!trans || trans.type !== 'tree')
      return

    return Object.values(trans.children).map(node => {
      return new vscode.CompletionItem(
        node.keyname,
        node.type === 'tree'
          ? vscode.CompletionItemKind.Field
          : vscode.CompletionItemKind.Text
      )
    })
  }
}

const m: ExtensionModule = (ctx: vscode.ExtensionContext) => {
  return vscode.languages.registerCompletionItemProvider(
    LanguageSelectors,
    new CompletionProvider(),
    '.'
  )
}

export default m
