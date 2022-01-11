import * as P from 'parsimmon'
import { alt, seq, string } from 'parsimmon'
import * as F from "./formula"
import Table from './table'
import Cell from './cell'

import * as Cmd from './command'


type Grammar = {
    command: Cmd.Command

    // commands
    help: Cmd.Help
    dependencies: Cmd.DisplayDependencies

    cell: Cell
    assign: Cmd.Assign
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
            command: l => alt(l.help, l.dependencies, l.assign).map((cmd) => cmd),

            // commands
            help: () => string("/help").map(_ => new Cmd.Help()),
            dependencies: () => string("/dependencies").map(_ => new Cmd.DisplayDependencies(this.table)),


            assign: l => seq(l.cell, string("="), alt(l.string, l.formula, l.number))
                .map(([cell, _, value]) => new Cmd.Assign(this.table, cell, value)),

            string: () => P.regexp(/[A-Za-z0-9 _\.,!?'/$]*/).wrap(string("\""), string("\""))
                .map((str) => str),

            number: () => P.regexp(/[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)/).map(n => parseFloat(n)),

            // formulas
            formula: l => alt(l.artm, l.sum, l.mul, l.div, l.sub, l.avg, l.cellRef),

            cellRef: l => l.cell
                .map((cell) => new F.CellReference(cell)),

            artm: l => seq(alt(l.cell, l.number), P.regexp(/\+|-|\*|\//), alt(l.cell, l.number))
                .map(([arg1, op, arg2]) => new F.Arithmetic(arg1, op, arg2)),

            sum: l => seq(string("sum"), l.range.wrap(string("("), string(")")))
                .map(([_, range]) => new F.Sum(...range)),

            div: l => seq(string('div'), l.range.wrap(string("("), string(")")))
                .map(([_, range]) => new F.Div(...range)),

            mul: l => seq(string('mul'), l.range.wrap(string("("), string(")")))
                .map(([_, range]) => new F.Mul(...range)),

            sub: l => seq(string('sub'), l.range.wrap(string("("), string(")")))
                .map(([_, range]) => new F.Sub(...range)),

            avg: l => seq(string('avg'), l.range.wrap(string("("), string(")")))
                .map(([_, range]) => new F.Avrg(...range)),


            // 
            range: l => seq(l.cell, string(':'), l.cell)
                .map(([a, _, b]) => this.table.getRange(a, b)),

            cell: l => seq(P.regexp(/[a-z]+/i), l.int)
                .map(([col, row]) => this.table.getCell(row, col)),

            // literals
            int: () => P.regexp(/[0-9]+/).map(n => parseInt(n, 10)),
        })
    }

    tryParse(cmd: string): any {
        return this.language.command.tryParse(cmd)
    }
}
