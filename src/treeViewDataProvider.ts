import * as _ from 'lodash';
import * as path from 'path';
import * as vscode from 'vscode';

import { Console } from 'console';

export class TreeViewDataProvider implements vscode.TreeDataProvider<Dependency> {
  constructor(private xmlFilePath?: vscode.Uri) {}

  addFile(filePath: vscode.Uri) {
    this.xmlFilePath = filePath;
  }

  hashasCoverageXMLFiles(): boolean {
    // TODO: call parser's API to scan temporary folder
    return !_.isUndefined(this.xmlFilePath);
  }

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Dependency): Thenable<Dependency[]> {
    if (!this.hashasCoverageXMLFiles()) {
      return Promise.resolve([]);
    }

    console.debug(`getChildren!!! ${element}`);

    if (element) {
      return Promise.resolve([
        // TODO: return children of element
        new Dependency(
          'child1',
          '/Users/maples7/CoverageXML-Parser/src/treeViewDataProvider.ts',
          vscode.TreeItemCollapsibleState.Expanded
        ),
        new Dependency(
          'child2',
          '/Users/maples7/CoverageXML-Parser/src/treeViewDataProvider.ts',
          vscode.TreeItemCollapsibleState.Expanded
        ),
      ]);
    } else {
      return Promise.resolve([
        // TODO: return root element
        new Dependency(
          'root',
          '/Users/maples7/CoverageXML-Parser/src/treeViewDataProvider.ts',
          vscode.TreeItemCollapsibleState.Expanded
        ),
      ]);
    }
  }
}

class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private filePath: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = `${path.basename(filePath)}`;
    this.description = filePath;
  }
}
