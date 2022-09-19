import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand(
    'coveragexml-parser.loadCoverageXML',
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage(
        'Hello World from CoverageXML-Parser!'
      );
    }
  );

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
