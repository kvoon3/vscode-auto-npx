import type { Terminal } from 'vscode'
import { platform } from 'node:os'
import { window, workspace } from 'vscode'

const isWindows = platform() === 'win32'

function resolveCmd(t: Terminal) {
  const winCmd = '$env:PATH = "{0}\\node_modules\\.bin;{1}" -f (Resolve-Path .), $env:PATH'
  const unixCmd = 'export PATH=$PWD/node_modules/.bin:$PATH'

  if (!isWindows)
    return unixCmd

  // @ts-expect-error type error
  if ([/bash/, /zsh/].some(re => re.test(t.creationOptions?.shellPath)))
    return unixCmd
  else
    return winCmd
}

function setup() {
  window.terminals.forEach(async (t) => {
    if (await t.processId)
      return
    t.sendText(resolveCmd(t))
  })
  window.onDidOpenTerminal((t) => {
    t.sendText(resolveCmd(t))
  })
}

export async function activate() {
  if (workspace.isTrusted)
    setup()
  else
    workspace.onDidGrantWorkspaceTrust(setup)
}

export function deactivate() {}
