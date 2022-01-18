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
    table: Cmd.DisplayTable
    clear: Cmd.Clear

    cell: Cell
    assign: Cmd.Assign
    formula: F.Formula
    lhFormula: F.Formula

    // operations
    sum: F.Sum
    div: F.Div
    mul: F.Mul
    sub: F.Sub
    avg: F.Avrg
    if: F.If
    ifArg: F.IfArg
    artm: F.Arithmetic
    cellRef: F.CellReference
    
    // utils
    range: Cell[]

    // operators
    booleanOp: BooleanOperator
    arithmeticOp: ArithmeticOperator

    // symbols
    comma: string

    // literals
    int: number
    number: number
    string: string
}

export default class Parser {

    language: P.TypedLanguage<Grammar>

    constructor(public table: Table) {
        this.language = P.createLanguage<Grammar>({
            command: l => alt(l.help, l.dependencies, l.table, l.clear, l.assign).map((cmd) => cmd),

            // commands
            help: () => string("/help").map(_ => new Cmd.Help()),
            dependencies: () => string("/dependencies").map(_ => new Cmd.DisplayDependencies(this.table)),
            table: () => string("/table").map(_ => new Cmd.DisplayTable(this.table)),
            clear: () => string("/clear").map(_ => new Cmd.Clear()),

            assign: l => seq(l.cell, string("="), alt(l.formula, l.string, l.number))
                .map(([cell, _, value]) => new Cmd.Assign(this.table, cell, value)),

            // formulas
            formula: l => alt(l.artm, l.if, l.sum, l.mul, l.div, l.sub, l.avg, l.cellRef),
            lhFormula: l => alt(l.if, l.sum, l.mul, l.div, l.sub, l.avg, l.cellRef),

            cellRef: l => l.cell
                .map((cell) => new F.CellReference(cell)),

            artm: l => seq(alt(l.cell, l.lhFormula, l.number), l.arithmeticOp, alt(l.cell, l.lhFormula, l.number), seq(l.arithmeticOp, alt(l.cell, l.lhFormula, l.number)).many())
                .map(([arg1, op, arg2, overflow]) => new F.Arithmetic(arg1, op, arg2, overflow)),

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

            ifArg: l => alt(l.cell, l.formula, l.number, l.string),
            if: l => seq(
                string("if"),
                seq(l.ifArg, l.booleanOp, l.ifArg.skip(l.comma), l.ifArg.skip(l.comma), l.ifArg)
                    .wrap(string("("), string(")"))
            ).map(([_, [arg1, op, arg2, out1, out2]]) => new F.If(arg1, op, arg2, out1, out2)),

            // 
            range: l => seq(l.cell, string(':'), l.cell)
                .map(([a, _, b]) => this.table.getRange(a, b)),

            cell: l => seq(P.regexp(/[a-z]+/i), l.int)
                .map(([col, row]) => this.table.getCell(row, col)),

            // symbols
            comma: () => P.string(","),

            // operators
            booleanOp: () => P.regexp(/\>|<|==|!=|>=|<=|\//).map(op => op as BooleanOperator),
            arithmeticOp: () => P.regexp(/\+|-|\*|\//).map(op => op as ArithmeticOperator),

            // literals
            int: () => P.regexp(/[0-9]+/).map(n => parseInt(n, 10)),
            string: () => P.regexp(/[A-Za-z0-9 _\.,!?'/$]*/).wrap(string("\""), string("\"")).map((str) => str),
            number: () => P.regexp(/[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)/).map(n => parseFloat(n)),
        })
    }

    tryParse(cmd: string): any {
        return this.language.command.tryParse(cmd)
    }
}