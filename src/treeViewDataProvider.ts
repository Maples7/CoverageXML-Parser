import * as path from 'path';
import * as vscode from 'vscode';

export class TreeViewDataProvider implements vscode.TreeDataProvider<Dependency>
{
  constructor(private xmlFilePath: string) {}

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Dependency): Thenable<Dependency[]> {
    if (!this.xmlFilePath) {
      vscode.window.showInformationMessage('No coverage XML file loaded.');
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve([
        // TODO: return children of element
      ]);
    } else {
      return Promise.resolve([
        // TODO: return root element
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

