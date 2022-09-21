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
    namespaceKeyName: string = ''
    classes: string[] = []
}

export class Class extends CoverageUnit {
    classKeyName: string = ''
}
