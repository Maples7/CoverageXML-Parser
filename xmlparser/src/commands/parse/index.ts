import * as fs from 'node:fs'
import * as readline from 'node:readline'
import { Command } from '@oclif/core'
import { Module, NamespaceTable, Class, Method, Lines } from './entity'
const XmlReader = require('xml-reader')

export default class parse extends Command {

  static description = 'Parse XML coverge file.'
  static args = [{name: 'xmlpath', description: 'The XML file we are going to parse.', required: true}]

  private sourceFiles: Record<string, string> = {}

  async run(): Promise<void> {

    const {args} = await this.parse(parse)
    const xmlPath: string = 'C:/Users/ruiyli/Downloads/netfxTest.coveragexml'
    const cachePath: string = 'C:/Users/ruiyli/Downloads/cache'

    // First reading round, for source file index only.
    this.log('Going to parse source file index...')

    const indexReader = XmlReader.create({stream: true});

    const indexLines = readline.createInterface({
      input: fs.createReadStream(xmlPath),
      crlfDelay: Infinity
    });

    indexReader.on('tag:SourceFileNames', (data:any) => {

      const sourceFileID = data.children.find((tag:any) => tag.name === 'SourceFileID').children[0].value
      const sourceFileName = data.children.find((tag:any) => tag.name === 'SourceFileName').children[0].value

      console.log(`SourceFileID = ${sourceFileID}, SourceFileName = ${sourceFileName}`)
      this.sourceFiles[sourceFileID] = sourceFileName
    });

    for await (const line of indexLines) {
      indexReader.parse(line)
    }

    // Second reading round, for real coverage content.
    this.log('Going to parse coverage content...')

    const contentReader = XmlReader.create({stream: true});

    const contentLines = readline.createInterface({
      input: fs.createReadStream(xmlPath),
      crlfDelay: Infinity
    });

    contentReader.on('tag:Module', (data:any) => {

      const moduleName = data.children.find((tag:any) => tag.name === 'ModuleName').children[0].value
      const imageSize = data.children.find((tag:any) => tag.name === 'ImageSize').children[0].value
      const imageLinkTime = data.children.find((tag:any) => tag.name === 'ImageLinkTime').children[0].value
      const linesCovered = data.children.find((tag:any) => tag.name === 'LinesCovered').children[0].value
      const linesPartiallyCovered = data.children.find((tag:any) => tag.name === 'LinesPartiallyCovered').children[0].value
      const linesNotCovered = data.children.find((tag:any) => tag.name === 'LinesNotCovered').children[0].value
      const blocksCovered = data.children.find((tag:any) => tag.name === 'BlocksCovered').children[0].value
      const blocksNotCovered = data.children.find((tag:any) => tag.name === 'BlocksNotCovered').children[0].value

      const module = new Module()
      module.name = moduleName
      module.imageSize = imageSize
      module.imageLinkTime = imageLinkTime
      module.linesCovered = linesCovered
      module.linesPartiallyCovered = linesPartiallyCovered
      module.linesNotCovered = linesNotCovered
      module.blocksCovered = blocksCovered
      module.blocksNotCovered = blocksNotCovered
      fs.writeFile(`${cachePath}/${module.name}.json`, JSON.stringify(module), () => null)
    });

    contentReader.on('tag:NamespaceTable', (data:any) => {

      const namespaceName = data.children.find((tag:any) => tag.name === 'NamespaceName').children[0].value
      const moduleName = data.children.find((tag:any) => tag.name === 'ModuleName').children[0].value
      const linesCovered = data.children.find((tag:any) => tag.name === 'LinesCovered').children[0].value
      const linesPartiallyCovered = data.children.find((tag:any) => tag.name === 'LinesPartiallyCovered').children[0].value
      const linesNotCovered = data.children.find((tag:any) => tag.name === 'LinesNotCovered').children[0].value
      const blocksCovered = data.children.find((tag:any) => tag.name === 'BlocksCovered').children[0].value
      const blocksNotCovered = data.children.find((tag:any) => tag.name === 'BlocksNotCovered').children[0].value

      const namespace = new NamespaceTable()
      namespace.name = namespaceName
      namespace.moduleName = moduleName
      namespace.linesCovered = linesCovered
      namespace.linesPartiallyCovered = linesPartiallyCovered
      namespace.linesNotCovered = linesNotCovered
      namespace.blocksCovered = blocksCovered
      namespace.blocksNotCovered = blocksNotCovered
      fs.writeFile(`${cachePath}/${namespace.moduleName} ${namespace.name}.json`, JSON.stringify(namespace), () => null)
    });

    contentReader.on('tag:Class', (data:any) => {

      const className = data.children.find((tag:any) => tag.name === 'ClassName').children[0].value
      const namespaceKeyName = data.children.find((tag:any) => tag.name === 'NamespaceKeyName').children[0].value
      const linesCovered = data.children.find((tag:any) => tag.name === 'LinesCovered').children[0].value
      const linesPartiallyCovered = data.children.find((tag:any) => tag.name === 'LinesPartiallyCovered').children[0].value
      const linesNotCovered = data.children.find((tag:any) => tag.name === 'LinesNotCovered').children[0].value
      const blocksCovered = data.children.find((tag:any) => tag.name === 'BlocksCovered').children[0].value
      const blocksNotCovered = data.children.find((tag:any) => tag.name === 'BlocksNotCovered').children[0].value

      const clazz = new Class()
      clazz.name = className
      clazz.namespaceName = NamespaceTable.ExtractNameFromKeyName(namespaceKeyName)
      clazz.moduleName = NamespaceTable.ExtractModuleNameFromKeyName(namespaceKeyName)
      clazz.linesCovered = linesCovered
      clazz.linesPartiallyCovered = linesPartiallyCovered
      clazz.linesNotCovered = linesNotCovered
      clazz.blocksCovered = blocksCovered
      clazz.blocksNotCovered = blocksNotCovered

      fs.writeFile(`${cachePath}/${clazz.moduleName} ${clazz.namespaceName} ${clazz.name}.json`, JSON.stringify(clazz), () => null)

      // We handle methods in class event because method, on its own, can not extract class name.
      const methodTags = data.children.filter((tag:any) => tag.name === 'Method')
      methodTags.forEach((methodTag:any) => {

        const methodName = methodTag.children.find((tag:any) => tag.name === 'MethodName').children[0].value
        const linesCovered = methodTag.children.find((tag:any) => tag.name === 'LinesCovered').children[0].value
        const linesPartiallyCovered = methodTag.children.find((tag:any) => tag.name === 'LinesPartiallyCovered').children[0].value
        const linesNotCovered = methodTag.children.find((tag:any) => tag.name === 'LinesNotCovered').children[0].value
        const blocksCovered = methodTag.children.find((tag:any) => tag.name === 'BlocksCovered').children[0].value
        const blocksNotCovered = methodTag.children.find((tag:any) => tag.name === 'BlocksNotCovered').children[0].value

        const method = new Method()
        method.name = methodName
        method.className = clazz.name
        method.namespaceName = clazz.namespaceName
        method.moduleName = clazz.moduleName
        method.linesCovered = linesCovered
        method.linesPartiallyCovered = linesPartiallyCovered
        method.linesNotCovered = linesNotCovered
        method.blocksCovered = blocksCovered
        method.blocksNotCovered = blocksNotCovered

        const linesTags = methodTag.children.filter((tag:any) => tag.name === 'Lines')
        linesTags.forEach((linesTag:any) => {

          const lnStart = linesTag.children.find((tag:any) => tag.name === 'LnStart').children[0].value
          const colStart = linesTag.children.find((tag:any) => tag.name === 'ColStart').children[0].value
          const lnEnd = linesTag.children.find((tag:any) => tag.name === 'LnEnd').children[0].value
          const colEnd = linesTag.children.find((tag:any) => tag.name === 'ColEnd').children[0].value
          const coverage = linesTag.children.find((tag:any) => tag.name === 'Coverage').children[0].value
          const sourceFileID = linesTag.children.find((tag:any) => tag.name === 'SourceFileID').children[0].value
          const lineID = linesTag.children.find((tag:any) => tag.name === 'LineID').children[0].value

          const lines = new Lines()
          lines.lnStart = lnStart
          lines.colStart = colStart
          lines.lnEnd = lnEnd
          lines.colEnd = colEnd
          lines.coverage = coverage
          lines.sourceFile = this.sourceFiles[sourceFileID]
          lines.lineID = lineID

          method.linesArray.push(lines)
        })

        fs.writeFile(`${cachePath}/${clazz.moduleName} ${clazz.namespaceName} ${clazz.name} ${method.name}.json`, JSON.stringify(method), () => null)
      });
    });

    for await (const line of contentLines) {
      contentReader.parse(line)
    }
  }
}
