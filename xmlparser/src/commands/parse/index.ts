import {Command} from '@oclif/core'

export default class parse extends Command {

  static description = 'Parse XML coverge file.'

  static args = [{name: 'xmlpath', description: 'The XML file we are going to parse.', required: true}]

  async run(): Promise<void> {
    const {args} = await this.parse(parse)

    this.log(`hello ${args.xmlpath}`)
  }
}
