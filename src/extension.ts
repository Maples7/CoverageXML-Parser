import * as vscode from 'vscode';

import { TreeViewDataProvider } from './treeViewDataProvider';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.window.registerTreeDataProvider(
    'coverageXMLParser',
    new TreeViewDataProvider('TODO.coveragexml')
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
