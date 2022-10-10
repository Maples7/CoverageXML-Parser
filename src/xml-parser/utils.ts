import * as fs from 'fs';
import * as vscode from 'vscode';

const UUID_REGEX: string = '\\w{8}-\\w{4}-\\w{4}-\\w{4}-\\w{12}';

export function extractNamesFromKeyName(keyName: string): [string, string] {
  const re: string = `^(.*)${UUID_REGEX}(.*)$`;
  const matches = keyName.match(re);
  if (matches) {
    return [matches[1], matches[2]];
  } else {
    throw new Error(
      `Can't parse Module name and Namespace name from [${keyName}].`
    );
  }
}

export function updateSourceFilePath(
  cachePath: vscode.Uri,
  oldPath: string,
  newPath: string
) {
  let offset: number = 1;
  const offsetUpperBound = Math.min(oldPath.length, newPath.length);
  while (
    offset < offsetUpperBound &&
    oldPath[oldPath.length - offset] === newPath[newPath.length - offset]
  ) {
    offset++;
  }
  const oldPathPrefix = oldPath.substring(0, oldPath.length - offset + 1);
  const newPathPrefix = newPath.substring(0, newPath.length - offset + 1);

  const sourceFileMap = vscode.Uri.joinPath(
    cachePath,
    'SourceFileMap.json'
  ).path;
  fs.readFile(sourceFileMap, 'utf-8', (err, data) => {
    data.replace(oldPathPrefix, newPathPrefix);
    fs.writeFile(sourceFileMap, data, () => null);
  });
}
