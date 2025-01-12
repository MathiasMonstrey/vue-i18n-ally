import { window, DecorationOptions, Range, workspace, Disposable } from 'vscode'
import { debounce } from 'lodash'
import { Global, KeyDetector } from '../core'
import { ExtensionModule } from '../modules'

const noneDecorationType = window.createTextEditorDecorationType({})

const underlineDecorationType = window.createTextEditorDecorationType({
  textDecoration: 'underline',
})

const annotation: ExtensionModule = (ctx) => {
  function update () {
    if (!Global.enabled)
      return

    const activeTextEditor = window.activeTextEditor
    if (!activeTextEditor)
      return

    const document = activeTextEditor.document
    const annotations: DecorationOptions[] = []
    const underlines: DecorationOptions[] = []

    const keys = KeyDetector.getKeys(document)
    // get all keys of current file
    keys.forEach(({ key, start, end }) => {
      underlines.push({
        range: new Range(
          document.positionAt(start),
          document.positionAt(end)
        ),
      })

      if (Global.annotations) {
        let missing = false

        let text = Global.loader.getValueByKey(key)
        // fallback to source
        if (!text && Global.displayLanguage !== Global.sourceLanguage) {
          text = Global.loader.getValueByKey(key, Global.sourceLanguage)
          missing = true
        }

        if (text)
          text = `◽️${text}`

        const color = missing
          ? 'rgba(153, 153, 153, .3)'
          : 'rgba(153, 153, 153, .7)'

        annotations.push({
          range: new Range(
            document.positionAt(start - 1),
            document.positionAt(end + 1)
          ),
          renderOptions: {
            after: {
              color,
              contentText: text,
              fontWeight: 'normal',
              fontStyle: 'normal',
            },
          },
        })
      }
    })

    activeTextEditor.setDecorations(noneDecorationType, annotations)
    activeTextEditor.setDecorations(underlineDecorationType, underlines)
  }

  const debounceUpdate = debounce(update, 500)

  const disposables: Disposable[] = []
  disposables.push(window.onDidChangeActiveTextEditor(debounceUpdate, null, ctx.subscriptions))
  disposables.push(workspace.onDidChangeTextDocument(debounceUpdate, null, ctx.subscriptions))
  disposables.push(Global.onDidChangeLoader(update))

  update()

  return disposables
}

export default annotation
