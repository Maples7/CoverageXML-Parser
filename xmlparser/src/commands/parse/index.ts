import * as fs from 'node:fs'
import * as readline from 'node:readline'
import { Command } from '@oclif/core'
import { Module } from './module'
const XmlReader = require('xml-reader')

export default class parse extends Command {

  static description = 'Parse XML coverge file.'
  static args = [{name: 'xmlpath', description: 'The XML file we are going to parse.', required: true}]

  private sourceFiles: Record<string, string> = {}
  private modules: Module[] = []

  async run(): Promise<void> {

    const {args} = await this.parse(parse)
    const path: string = 'C:/Users/ruiyli/Downloads/netfxTest.coveragexml'

    // First reading round, for source file index only.
    this.log('Going to parse source file index...')

    const indexReader = XmlReader.create({stream: true});

    const indexLines = readline.createInterface({
      input: fs.createReadStream(path),
      crlfDelay: Infinity
    });

    indexReader.on('tag:SourceFileNames', (data:any) => {

      const sourceFileID = data.children.find((tag:any) => tag.name === 'SourceFileID').children[0].value
      const sourceFileName = data.children.find((tag:any) => tag.name === 'SourceFileName').children[0].value

      console.log(`SourceFileID = ${sourceFileID}, SourceFileName = ${sourceFileName}`)
      this.sourceFiles[data.SourceFileID] = data.SourceFileName
    });

    for await (const line of indexLines) {
      indexReader.parse(line)
    }

    // Second reading round, for real coverage content.
    this.log('Going to parse coverage content...')

    const contentReader = XmlReader.create({stream: true});

    const contentLines = readline.createInterface({
      input: fs.createReadStream(path),
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
      module.moduleName = moduleName
      module.imageSize = imageSize
      module.imageLinkTime = imageLinkTime
      module.linesCovered = linesCovered
      module.linesPartiallyCovered = linesPartiallyCovered
      module.linesNotCovered = linesNotCovered
      module.blocksCovered = blocksCovered
      module.blocksNotCovered = blocksNotCovered
      this.modules.push(module)
    });

    for await (const line of contentLines) {
      contentReader.parse(line)
    }

    console.log(this.modules)
  }
}
