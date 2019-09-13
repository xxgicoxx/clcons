const vscode = require('vscode');

function activate(context) {
	console.log('ClCons is now active!');

	let disposable = vscode.commands.registerCommand('extension.clcons', function () {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			vscode.window.showErrorMessage(`Can't remove log because no document is open`);
			return;
		} else {
			const document = editor.document;
			const text = editor.document.getText();

			let workspaceEdit = new vscode.WorkspaceEdit();
			const logStatements = getAllLogStatements(document, text);

			deleteFoundLogStatements(workspaceEdit, document.uri, logStatements);
		}
	});

	context.subscriptions.push(disposable);
}

function deactivate() {}

function getAllLogStatements(document, documentText) {
    let logStatements = [];
    const logRegex = /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\((.*)\);?/g;
    let match;

    while (match = logRegex.exec(documentText)) {
        let matchRange = new vscode.Range(document.positionAt(match.index), document.positionAt(match.index + match[0].length));
        if (!matchRange.isEmpty) {
            logStatements.push(matchRange);
        }
    }

    return logStatements;
}

function deleteFoundLogStatements(workspaceEdit, docUri, logs) {
    logs.forEach((log) => {
		workspaceEdit.delete(docUri, log);
    });

    vscode.workspace.applyEdit(workspaceEdit).then(() => {
        vscode.window.showInformationMessage(`${logs.length} console.log(s) deleted`)
    });
}

module.exports = {
	activate,
	deactivate
}