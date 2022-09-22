import * as _ from 'lodash';
import * as path from 'path';
import * as vscode from 'vscode';

import { Console } from 'console';

export class TreeViewDataProvider implements vscode.TreeDataProvider<Dependency> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    Dependency | undefined | void
  > = new vscode.EventEmitter<Dependency | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> =
    this._onDidChangeTreeData.event;

  constructor(private xmlFilePath?: vscode.Uri) {}

  addFile(filePath: vscode.Uri) {
    this.xmlFilePath = filePath;
    this.refresh();
  }

  removeFile(filePath: string) {
    // TODO: clean up temporary folder related to this file
    this.xmlFilePath = undefined;
    this.refresh();
  }

  hashasCoverageXMLFiles(): boolean {
    // TODO: call parser's API to scan temporary folder
    return !_.isUndefined(this.xmlFilePath);
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Dependency): Thenable<Dependency[]> {
    console.debug(`getChildren!!! ${element?.label} - ${this.xmlFilePath}`);

    if (!this.hashasCoverageXMLFiles()) {
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve([
        // TODO: return children of element
        new Dependency(
          'child1',
          '/Users/maples7/CoverageXML-Parser/src/treeViewDataProvider.ts',
          vscode.TreeItemCollapsibleState.None
        ),
        new Dependency(
          'child2',
          '/Users/maples7/CoverageXML-Parser/src/treeViewDataProvider.ts',
          vscode.TreeItemCollapsibleState.None
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

export class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public filePath: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = `${path.basename(filePath)}`;
    this.description = filePath;
    this.contextValue = label;
  }
}
