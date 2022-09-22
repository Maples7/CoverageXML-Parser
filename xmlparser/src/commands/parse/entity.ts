export class CoverageUnit {
    name: string = ''
    linesCovered: string = ''
    linesPartiallyCovered: string = ''
    linesNotCovered: string = ''
    blocksCovered: string = ''
    blocksNotCovered: string = ''
}

export class Module extends CoverageUnit {
    imageSize: string = ''
    imageLinkTime: string = ''
    namespaceTables: string[] = []
}

export class NamespaceTable extends CoverageUnit {
    moduleName: string = ''
    classes: string[] = []

    public static ExtractNameFromKeyName(keyName: string): string {
        const re: string = '\\w{8}-\\w{4}-\\w{4}-\\w{4}-\\w{12}(.*)$'
        var matches = keyName.match(re)
        if (matches) {
            return matches[1]
        } else {
            throw `No namespace name available from [${keyName}].`
        }
    }

    public static ExtractModuleNameFromKeyName(keyName: string): string {
        const re: string = '^(.*)\\w{8}-\\w{4}-\\w{4}-\\w{4}-\\w{12}'
        var matches = keyName.match(re)
        if (matches) {
            return matches[1]
        } else {
            throw `No module name available from [${keyName}].`
        }
    }
}

export class Class extends CoverageUnit {
    namespaceName: string = ''
    moduleName: string = ''
}
