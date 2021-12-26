import * as P from 'parsimmon'
import * as F from "./formula"
import Table from './table'
import Cell from './cell'

function range(start: number, end: number): number[] {
    const result: number[] = []
    let i = start
    while (i <= end) {
        result.push(i)
        i += 1
    }
    return result
}

type Grammar = {
    formula: F.Sum | F.Div | F.Mul | F.Sub | F.CellReference,
    sumFormula: F.Sum,
    rangeCells: Array<Cell>,
    cellReference: F.CellReference,
    cellFormula: Cell,
    
    // literals
    stringLiteral: string,
    numberLiteral: number,
}

export default class Parser {

    language: P.TypedLanguage<Grammar>

    constructor(public table: Table) {
        this.language = P.createLanguage<Grammar>({
            formula: l => P.alt(l.sumFormula, l.cellReference),

            cellReference: l => P.seq(l.cellFormula).map(([cell]) => new F.CellReference(cell)),

            cellFormula: l => P.seq(l.stringLiteral, l.numberLiteral)
                .map(([col, row]) => this.table.getCell(row,col)),

            rangeCells: l => P.seq(l.cellFormula, P.string(':'), l.cellFormula)
                .map(([a, _, b]) => this.table.getRange(a, b)),

            sumFormula: l => P.seq(P.string('SUM('), l.rangeCells, P.string(')'))
                .map(([_, rangeArray, __]) => new F.Sum(...rangeArray)),

            numberLiteral: _ => P.digits.map(row => parseInt(row, 10)),
            stringLiteral: _ => P.letters
        })
    }

    tryParse(str: string) {
        return this.language.formula.tryParse(str)
    }

    tryParseCell(str: string) {
        return this.language.cellFormula.tryParse(str)
    }

}
