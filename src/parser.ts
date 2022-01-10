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
    div: F.Div
    mul: F.Mul
    sub: F.Sub
    avg: F.Avrg
    cellRef: F.CellReference
    artm: F.Arithmetic

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

            // commands
            help: () => string("help").map(_ => console.log("this is the help command output")),


            assign: l => seq(l.cell, string("="), alt(l.string, l.formula, l.number))
                .map(([cell, _, value]) => cell.modifyCell(value)),
            
            string: () => P.regexp(/[A-Za-z0-9 _\.,!?'/$]*/).wrap(string("\""), string("\""))
                .map((str) => str),

            number: () => P.regexp(/[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)/).map(n => parseFloat(n)),

            // formulas
            formula: l => alt(l.artm, l.sum, l.mul, l.div, l.sub, l.avg, l.cellRef),

            cellRef: l => l.cell
                .map((cell) => new F.CellReference(cell)),

            artm: l => seq(alt(l.cell, l.number), alt(string('+'),string('-'),string('*'),string('/')), alt(l.cell, l.number))
                .map(([arg1, op, arg2]) => new F.Arithmetic(arg1, op, arg2)),

            sum: l => seq(string("sum"), l.range.wrap(string("("), string(")")))
                .map(([_, range]) => new F.Sum(...range)),

            div: l => seq(string('div'), l.range).wrap(string("\""), string("\""))
                .map(([_, rangeArray]) => new F.Div(...rangeArray)),

            mul: l => seq(string('mul'), l.range).wrap(string("\""), string("\""))
                .map(([_, rangeArray]) => new F.Mul(...rangeArray)),

            sub: l => seq(string('sub'), l.range).wrap(string("\""), string("\""))
                .map(([_, rangeArray]) => new F.Sub(...rangeArray)),

            avg: l => seq(string('avg'), l.range).wrap(string("\""), string("\""))
                .map(([_, rangeArray]) => new F.Avrg(...rangeArray)),


            // 
            range: l => seq(l.cell, string(':'), l.cell)
                .map(([a, _, b]) => this.table.getRange(a, b)),

            cell: l => seq(P.regexp(/[a-z]+/i), l.int)
                .map(([col, row]) => this.table.getCell(row, col)),
            
            // literals
            int: () => P.regexp(/[0-9]+/).map(n => parseInt(n, 10)),
        })
    }

    tryParse(cmd: string) {
        return this.language.command.tryParse(cmd)
    }
}
