import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { coverageXMLParse } from './xml-parser';

export class TreeViewDataProvider
  implements vscode.TreeDataProvider<Dependency>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    Dependency | undefined | void
  > = new vscode.EventEmitter<Dependency | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> =
    this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {}

  private getRootFolderPath(filePath: string): vscode.Uri {
    const globalStorage = this.context.globalStorageUri;
    console.debug(`globalStorage: ${globalStorage.path}`);
    const fileNameWithoutExtension = path.parse(filePath).name;
    return vscode.Uri.joinPath(globalStorage, fileNameWithoutExtension);
  }

  private async getLoadedFolders(): Promise<string[]> {
    const globalStorage = this.context.globalStorageUri;
    console.debug(`globalStorage: ${globalStorage.path}`);
    console.debug(`globalStorage exist?: ${fs.existsSync(globalStorage.path)}`);
    if (!fs.existsSync(globalStorage.path)) {
      try {
        await vscode.workspace.fs.createDirectory(globalStorage);
      } catch (error) {
        vscode.window.showErrorMessage(
          `Can't create the global storage directory in [${globalStorage.path}]: ${error}`
        );
      }
    }
    return vscode.workspace.fs
      .readDirectory(globalStorage)
      .then((items) => items.map(([name, _]) => name));
  }

  async addFile(filePath: vscode.Uri) {
    const jsonFolder = this.getRootFolderPath(filePath.path);
    try {
      await vscode.workspace.fs.createDirectory(jsonFolder);
    } catch (error) {
      vscode.window.showErrorMessage(
        `Can't create a storage directory in [${jsonFolder.path}] for [${filePath.path}]: ${error}`
      );
    }

    await coverageXMLParse(filePath, jsonFolder);

    this.refresh();
  }

  async removeFile(filePath: string) {
    const jsonFolder = this.getRootFolderPath(filePath);
    try {
      await vscode.workspace.fs.delete(jsonFolder, {
        recursive: true,
        useTrash: true,
      });
    } catch (error) {
      vscode.window.showErrorMessage(
        `Can't remove a storage directory in [${jsonFolder.path}] for [${filePath}]: ${error}`
      );
    }

    this.refresh();
  }

  async hasCoverageXMLFiles(): Promise<boolean> {
    return this.getLoadedFolders().then((folders) => folders.length > 0);
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: Dependency): Promise<Dependency[]> {
    console.debug(`getChildren!!! ${element?.label}`);

    if (!this.hasCoverageXMLFiles()) {
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve([
        // TODO: return children of element
        new Dependency('child1', vscode.TreeItemCollapsibleState.None),
        new Dependency('child2', vscode.TreeItemCollapsibleState.None),
      ]);
    } else {
      return this.getLoadedFolders().then((folders) =>
        folders.map(
          (name) =>
            new Dependency(
              name,
              vscode.TreeItemCollapsibleState.Collapsed,
              'root'
            )
        )
      );
    }
  }
}

export class Dependency extends vscode.TreeItem {
  constructor(
    public readonly fileName: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly contextValue?: string
  ) {
    const label = path.parse(fileName).name;
    super(label, collapsibleState);
    this.fileName = fileName;
    this.contextValue = contextValue;
  }
}
