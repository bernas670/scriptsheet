import * as P from 'parsimmon'
import { alt, seq, string } from 'parsimmon'
import * as F from "./formula"
import Table from './table'
import Cell from './cell'


type Grammar = {
    command: void

    // commands
    help: void

    cell: Cell
    assign: void
    formula: F.Formula
    string: string

    // operations
    sum: F.Sum
    cellRef: F.CellReference

    // utils
    range: Cell[]

    // literals
    int: number
    number: number
}

export default class Parser {

    language: P.TypedLanguage<Grammar>

    constructor(public table: Table) {
        this.language = P.createLanguage<Grammar>({
            command: l => alt(seq(string("/"), alt(l.help)), l.assign),

            help: () => string("help").map(_ => console.log("this is the help command output")),

            assign: l => seq(l.cell, string("="), alt(l.string, l.formula, l.number))
                .map(([cell, _, value]) => cell.modifyCell(value)),

            formula: l => alt(l.sum, l.cellRef),

            string: () => P.regexp(/[A-Za-z0-9 _\.,!?'/$]*/).wrap(string("\""), string("\""))
                .map((str) => str),

            cellRef: l => l.cell
                .map((cell) => new F.CellReference(cell)),

            sum: l => seq(string("sum"), l.range.wrap(string("("), string(")")))
                .map(([_, range]) => new F.Sum(...range)),

            range: l => seq(l.cell, string(':'), l.cell)
                .map(([a, _, b]) => this.table.getRange(a, b)),

            cell: l => seq(P.regexp(/[a-z]+/i), l.int)
                .map(([col, row]) => this.table.getCell(row, col)),
            
            int: () => P.regexp(/[0-9]+/).map(n => parseInt(n, 10)),
            number: () => P.regexp(/[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)/).map(n => parseFloat(n))
        })
    }

    tryParse(cmd: string) {
        return this.language.command.tryParse(cmd)
    }
}
