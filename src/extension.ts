import * as vscode from 'vscode';

import { TreeViewDataProvider } from './treeViewDataProvider';

export function activate(context: vscode.ExtensionContext) {
  let disposableItems = [];

  const treeViewDataProvider = new TreeViewDataProvider();
  disposableItems.push(
    vscode.window.registerTreeDataProvider(
      'coverageXMLParser',
      treeViewDataProvider
    )
  );
  disposableItems.push(
    vscode.commands.registerCommand('coverageXMLParser.addFile', (filePath: string) =>
      treeViewDataProvider.addFile(filePath)
    )
  );

  context.subscriptions.push(...disposableItems);
}

// this method is called when your extension is deactivated
export function deactivate() {}
