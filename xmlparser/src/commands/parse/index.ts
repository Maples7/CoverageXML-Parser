import * as fs from 'node:fs'
import * as readline from 'node:readline'
import {Command} from '@oclif/core'
const XmlReader = require('xml-reader')

export default class parse extends Command {

  static description = 'Parse XML coverge file.'
  static args = [{name: 'xmlpath', description: 'The XML file we are going to parse.', required: true}]

  private sourceFiles: Record<string, string> = {} as Record<string, string>

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

      console.log(`ModuleName = ${moduleName}`)
    });

    for await (const line of contentLines) {
      contentReader.parse(line)
    }
  }
}
