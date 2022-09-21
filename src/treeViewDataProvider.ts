import * as path from 'path';
import * as vscode from 'vscode';

export class TreeViewDataProvider implements vscode.TreeDataProvider<Dependency>
{
  constructor(private xmlFilePath?: vscode.Uri) {}

  addFile(filePath: vscode.Uri) {
    this.xmlFilePath = filePath;
  }

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Dependency): Thenable<Dependency[]> {
    if (!this.xmlFilePath) {
      vscode.window.showInformationMessage('No CovergaXML file loaded.');
      return Promise.resolve([]);
    }

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
