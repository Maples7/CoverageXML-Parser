import * as fs from 'node:fs'
import * as readline from 'node:readline'
import {Command} from '@oclif/core'
const XmlReader = require('xml-reader')

export default class parse extends Command {

  static description = 'Parse XML coverge file.'

  static args = [{name: 'xmlpath', description: 'The XML file we are going to parse.', required: true}]

  async run(): Promise<void> {
    const {args} = await this.parse(parse)

    this.log(`hello ${args.xmlpath}`)

    const reader = XmlReader.create({stream: true});
    const fileStream = fs.createReadStream("C:/Users/ruiyli/Downloads/test.xml")

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    reader.on('tag:item', (data:any) => console.log(data));
    reader.on('done', (data:any) => console.log(data.children.length));

    for await (const line of rl) {
      console.log(`Line from file: ${line}`);
      reader.parse(line)
    }
  }
}
