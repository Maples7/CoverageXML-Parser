import * as _ from 'lodash';
import * as vscode from 'vscode';

import { Dependency, TreeViewDataProvider } from './treeViewDataProvider';

export function activate(context: vscode.ExtensionContext) {
  let disposableItems = [];
  const treeViewDataProvider = new TreeViewDataProvider(context);

  vscode.commands.executeCommand(
    'setContext',
    'hasCoverageXMLFiles',
    async () => await treeViewDataProvider.hasCoverageXMLFiles()
  );
  disposableItems.push(
    vscode.window.registerTreeDataProvider(
      'coverageXMLTreeView',
      treeViewDataProvider
    )
  );
  disposableItems.push(
    vscode.commands.registerCommand('coverageXMLParser.addFile', () => {
      vscode.window
        .showOpenDialog({
          canSelectFiles: true,
          canSelectFolders: false,
          canSelectMany: false,
          openLabel: 'Select a CovergaXML file',
          filters: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Coverage XML': ['coveragexml'],
          },
        })
        .then(async (filePath) => {
          console.debug(`Test Command!!! ${filePath}`);
          if (!_.isArray(filePath) || filePath.length === 0) {
            return;
          }
          await treeViewDataProvider.addFile(filePath[0]);
        });
    })
  );
  disposableItems.push(
    vscode.commands.registerCommand(
      'coverageXMLParser.removeFile',
      async (node: Dependency) => {
        console.debug(`Remove Command!!! ${node.label} - ${node.fileName}`);
        await treeViewDataProvider.removeFile(node.fileName);
      }
    )
  );

  context.subscriptions.push(...disposableItems);
}

// this method is called when your extension is deactivated
export function deactivate() {}
