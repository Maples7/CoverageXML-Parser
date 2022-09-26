import * as Promise from 'bluebird';
import * as XMLReader from 'xml-reader';
import * as fs from 'fs';
import * as readline from 'readline';
import * as vscode from 'vscode';

import { extractNamesFromKeyName } from './utils';

interface ICoverageUnit {
  linesCovered?: string;
  linesPartiallyCovered?: string;
  linesNotCovered?: string;
  blocksCovered?: string;
  blocksNotCovered?: string;
}

interface IModule extends ICoverageUnit {
  name?: string;
  imageSize?: string;
  imageLinkTime?: string;
}

interface INamespace extends ICoverageUnit {
  name?: string;
  moduleName?: string;
}

interface IClass extends ICoverageUnit {
  name?: string;
  namespaceName?: string;
  moduleName?: string;
}

interface ILine {
  lnStart?: string;
  colStart?: string;
  lnEnd?: string;
  colEnd?: string;
  coverage?: string;
  sourceFile?: string;
  lineId?: string;
}

interface IMethod extends ICoverageUnit {
  name?: string;
  className?: string;
  namespaceName?: string;
  moduleName?: string;
  lines: ILine[];
}

export async function coverageXMLParse(
  xmlPath: vscode.Uri,
  cachePath: vscode.Uri
) {
  const sourceFiles: Record<string, string> = {};
  const jsonFiles: [vscode.Uri, string][] = [];

  const xmlFileReader = XMLReader.create({ stream: true });
  const xmlFileLines = readline.createInterface({
    input: fs.createReadStream(xmlPath.path),
    crlfDelay: Infinity,
  });

  xmlFileReader.on('tag:SourceFileNames', (data: any) => {
    let sourceFileID: string = '';
    let sourceFileName: string = '';

    data.children.forEach((tag: any) => {
      const value = tag.children[0].value;
      switch (tag.name) {
        case 'SourceFileID':
          sourceFileID = value;
          break;
        case 'SourceFileName':
          sourceFileName = value;
          break;
      }
    });
    console.debug(
      `SourceFileID = ${sourceFileID}, SourceFileName = ${sourceFileName}`
    );
    sourceFiles[sourceFileID] = sourceFileName;
  });

  xmlFileReader.on('tag:Module', (data: any) => {
    const moduleObject: IModule = {};

    data.children.forEach((tag: any) => {
      const value = tag.children[0].value;
      switch (tag.name) {
        case 'ModuleName':
          moduleObject.name = value;
          break;
        case 'ImageSize':
          moduleObject.imageSize = value;
          break;
        case 'ImageLinkTime':
          moduleObject.imageLinkTime = value;
          break;
        case 'LinesCovered':
          moduleObject.linesCovered = value;
          break;
        case 'LinesPartiallyCovered':
          moduleObject.linesPartiallyCovered = value;
          break;
        case 'LinesNotCovered':
          moduleObject.linesNotCovered = value;
          break;
        case 'BlocksCovered':
          moduleObject.blocksCovered = value;
          break;
        case 'BlocksNotCovered':
          moduleObject.blocksNotCovered = value;
          break;
      }
    });

    jsonFiles.push([
      vscode.Uri.joinPath(cachePath, `${moduleObject.name}.json`),
      JSON.stringify(moduleObject),
    ]);
  });

  xmlFileReader.on('tag:NamespaceTable', (data: any) => {
    const namespaceObject: INamespace = {};

    data.children.forEach((tag: any) => {
      const value = tag.children[0].value;
      switch (tag.name) {
        case 'NamespaceName':
          namespaceObject.name = value;
          break;
        case 'ModuleName':
          namespaceObject.moduleName = value;
          break;
        case 'LinesCovered':
          namespaceObject.linesCovered = value;
          break;
        case 'LinesPartiallyCovered':
          namespaceObject.linesPartiallyCovered = value;
          break;
        case 'LinesNotCovered':
          namespaceObject.linesNotCovered = value;
          break;
        case 'BlocksCovered':
          namespaceObject.blocksCovered = value;
          break;
        case 'BlocksNotCovered':
          namespaceObject.blocksNotCovered = value;
          break;
      }
    });

    jsonFiles.push([
      vscode.Uri.joinPath(
        cachePath,
        `${namespaceObject.moduleName}-${namespaceObject.name}.json`
      ),
      JSON.stringify(namespaceObject),
    ]);
  });

  xmlFileReader.on('tag:Class', (data: any) => {
    const classObject: IClass = {};

    data.children.forEach((tag: any) => {
      const value = tag.children[0].value;
      switch (tag.name) {
        case 'ClassName':
          classObject.name = value;
          break;
        case 'NamespaceKeyName':
          const [namespaceName, moduleName] = extractNamesFromKeyName(value);
          classObject.namespaceName = namespaceName;
          classObject.moduleName = moduleName;
          break;
        case 'LinesCovered':
          classObject.linesCovered = value;
          break;
        case 'LinesPartiallyCovered':
          classObject.linesPartiallyCovered = value;
          break;
        case 'LinesNotCovered':
          classObject.linesNotCovered = value;
          break;
        case 'BlocksCovered':
          classObject.blocksCovered = value;
          break;
        case 'BlocksNotCovered':
          classObject.blocksNotCovered = value;
          break;
      }
    });

    jsonFiles.push([
      vscode.Uri.joinPath(
        cachePath,
        `${classObject.moduleName}-${classObject.namespaceName}-${classObject.name}.json`
      ),
      JSON.stringify(classObject),
    ]);

    // We handle methods in class event because method, on its own, can not extract class name.
    data.children
      .filter((tag: any) => tag.name === 'Method')
      .forEach((methodTag: any) => {
        const methodObject: IMethod = {
          className: classObject.name,
          namespaceName: classObject.namespaceName,
          moduleName: classObject.moduleName,
          lines: [],
        };
        const linesTags: any[] = [];
        methodTag.children.forEach((tag: any) => {
          const value = tag.children[0].value;
          switch (tag.name) {
            case 'MethodName':
              methodObject.name = value;
              break;
            case 'LinesCovered':
              methodObject.linesCovered = value;
              break;
            case 'LinesPartiallyCovered':
              methodObject.linesPartiallyCovered = value;
              break;
            case 'LinesNotCovered':
              methodObject.linesNotCovered = value;
              break;
            case 'BlocksCovered':
              methodObject.blocksCovered = value;
              break;
            case 'BlocksNotCovered':
              methodObject.blocksNotCovered = value;
              break;
            case 'Lines':
              linesTags.push(tag);
              break;
          }
        });

        linesTags.forEach((linesTag: any) => {
          const lineObject: ILine = {};
          linesTag.children.forEach((tag: any) => {
            const value = tag.children[0].value;
            switch (tag.name) {
              case 'LnStart':
                lineObject.lnStart = value;
                break;
              case 'ColStart':
                lineObject.colStart = value;
                break;
              case 'LnEnd':
                lineObject.lnEnd = value;
                break;
              case 'ColEnd':
                lineObject.colEnd = value;
                break;
              case 'Coverage':
                lineObject.coverage = value;
                break;
              case 'SourceFileID':
                lineObject.sourceFile = value;
                break;
              case 'LineID':
                lineObject.lineId = value;
            }
          });
          methodObject.lines.push(lineObject);
        });

        jsonFiles.push([
          vscode.Uri.joinPath(
            cachePath,
            `${classObject.moduleName}-${classObject.namespaceName}-${classObject.name}-${methodObject.name}`
          ),
          JSON.stringify(methodObject),
        ]);
      });
  });

  xmlFileReader.on('end', async () => {
    jsonFiles.push([
      vscode.Uri.joinPath(cachePath, 'SourceFileMap.json'),
      JSON.stringify(sourceFiles),
    ]);

    await Promise.map(jsonFiles, ([fileUri, jsonContent]) =>
      fs.promises.writeFile(fileUri.path, jsonContent)
    );
  });

  for await (const line of xmlFileLines) {
    xmlFileReader.parse(line);
  }
}
