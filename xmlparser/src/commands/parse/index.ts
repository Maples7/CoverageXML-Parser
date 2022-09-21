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

    this.log(`hello ${args.xmlpath}`)

    const reader = XmlReader.create({stream: true});
    const fileStream = fs.createReadStream('C:/Users/ruiyli/Downloads/netfxTest2.xml')

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    reader.on('tag:SourceFileNames', (data:any) => {

      const sourceFileID = data.children.find((tag:any) => tag.name === 'SourceFileID').children[0].value
      const sourceFileName = data.children.find((tag:any) => tag.name === 'SourceFileName').children[0].value

      console.log(`SourceFileID = ${sourceFileID}, SourceFileName = ${sourceFileName}`)
      this.sourceFiles[data.SourceFileID] = data.SourceFileName
    });

    for await (const line of rl) {
      reader.parse(line)
    }
  }
}
