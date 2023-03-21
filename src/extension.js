const vscode = require('vscode');

const { constants } = require('./utils');

function getAllLogStatements(document, documentText) {
  const logStatements = [];
  const logRegex = /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\((.*)\);?/g;
  let match = logRegex.exec(documentText);

  while (match) {
    const matchRange = new vscode.Range(
      document.positionAt(match.index),
      document.positionAt(match.index + match[0].length),
    );

    if (!matchRange.isEmpty) {
      logStatements.push(matchRange);
    }

    match = logRegex.exec(documentText);
  }

  return logStatements;
}

function deleteFoundLogStatements(workspaceEdit, docUri, logs) {
  logs.forEach((log) => {
    workspaceEdit.delete(docUri, log);
  });

  vscode.workspace.applyEdit(workspaceEdit).then(() => {
    vscode.window.showInformationMessage(`${logs.length} ${constants.MESSAGE_CONSOLE_REMOVED}`);
  });
}

function activate(context) {
  console.log('ClCons is now active!');

  const disposable = vscode.commands.registerCommand(constants.COMMAND_NAME, () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage(constants.MESSAGE_CONSOLE_CANT_REMOVE);
    } else {
      const { document } = editor;
      const text = editor.document.getText();

      const workspaceEdit = new vscode.WorkspaceEdit();
      const logStatements = getAllLogStatements(document, text);

      deleteFoundLogStatements(workspaceEdit, document.uri, logStatements);
    }
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
