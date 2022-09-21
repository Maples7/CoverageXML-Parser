import * as _ from 'lodash';
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
    vscode.commands.registerCommand('coverageXMLParser.addFile', () => {
      vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: 'Select a CovergaXML file'
      }).then((filePath) => {
        console.debug(`Test Command!!! ${filePath}`);
        if (!_.isArray(filePath) || filePath.length === 0) {
          return;
        }
        treeViewDataProvider.addFile(filePath[0]);
      });
    })
  );

  context.subscriptions.push(...disposableItems);
}

// this method is called when your extension is deactivated
export function deactivate() {}
