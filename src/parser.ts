import * as P from 'parsimmon'
import { alt, seq, string } from 'parsimmon'
import * as F from "./formula"
import Table from './table'
import Cell from './cell'


type Grammar = {
    // command: void,

    // //commands
    // commands: void,
    help: void,
    // display: void,

    // // cell operations
    // assign: void,
    // formula: F.Sum | F.Div | F.Mul | F.Sub | F.CellReference,
    // sumFormula: F.Sum,
    // rangeCells: Array<Cell>,
    // cellReference: F.CellReference,
    // cellFormula: Cell,

    // // literals
    // letters: string,
    // numbers: number,
}

export default class Parser {

    language: P.TypedLanguage<Grammar>

    constructor(public table: Table) {
        this.language = P.createLanguage<Grammar>({
            // command: l => alt(seq(string("/"), l.commands), l.assign),

            // // commands
            // commands: l => alt(l.help, l.display),
            help: _ => string("help").map(_ => console.log("help command output")),
            // display: _ => string("display").map(_ => console.log("display command")),

            // // table operations
            // assign: l => P.seq(l.cellFormula, P.string("="), P.alt(l.formula, l.letters, l.numbers))
            //     .map(([cell, _, value]) => cell.modifyCell(value)),

            // formula: l => P.alt(l.sumFormula, l.cellReference),

            // cellFormula: l => P.seq(l.letters, l.numbers)
            //     .map(([col, row]) => this.table.getCell(row, col)),

            // cellReference: l => P.seq(l.cellFormula)
            //     .map(([cell]) => new F.CellReference(cell)),

            // rangeCells: l => P.seq(l.cellFormula, string(':'), l.cellFormula)
            //     .map(([a, _, b]) => this.table.getRange(a, b)),

            // sumFormula: l => P.seq(P.string('SUM('), l.rangeCells, P.string(')'))
            //     .map(([_, rangeArray, __]) => new F.Sum(...rangeArray)),

            // numbers: _ => P.digits.map(n => parseInt(n, 10)),
            // letters: _ => P.letters
        })
    }

    tryParse(cmd: string) {
        return this.language.help.tryParse(cmd)
    }
}
