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
    letters: string
    numbers: number

}

export default class Parser {

    language: P.TypedLanguage<Grammar>

    constructor(public table: Table) {
        this.language = P.createLanguage<Grammar>({
            command: l => alt(seq(string("/"), alt(l.help)), l.assign),

            help: () => string("help").map(_ => console.log("this is the help command output")),

            // FIXME: there is some ambiguity here that i dont understand
            assign: l => seq(l.cell, string("="), alt(l.string, l.formula)) //alt(l.string, l.numbers, l.formula))
                .map(([cell, _, value]) => {
                    console.log(cell.name)
                    console.log(value)
                    return cell.modifyCell(value)}),

            formula: l => alt(l.sum, l.cellRef),

            string: l => l.letters.wrap(string("\""), string("\""))
                .map((str) => str),

            cellRef: l => l.cell
                .map((cell) => new F.CellReference(cell)),

            sum: l => seq(string("sum"), l.range.wrap(string("("), string(")")))
                .map(([_, range]) => new F.Sum(...range)),

            range: l => seq(l.cell, string(':'), l.cell)
                .map(([a, _, b]) => this.table.getRange(a, b)),

            cell: l => seq(l.letters, l.numbers)
                .map(([col, row]) => {
                    console.log(`col: ${col} row: ${row}`)
                    return this.table.getCell(row, col)}),

            numbers: () => P.digits.map(n => parseInt(n, 10)),
            letters: () => P.letters
        })
    }

    tryParse(cmd: string) {
        return this.language.command.tryParse(cmd)
    }
}
