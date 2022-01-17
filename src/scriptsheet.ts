import Parser from "./parser"
import Table from "./table"

import repl from "repl"
import { Context } from "vm"
import { SCError } from "./error"
import * as Cmd from './command'


export default class ScriptSheet {

    table: Table
    parser: Parser

    constructor() {
        this.table = new Table(10, 20)
        this.parser = new Parser(this.table)
    }

    eval(cmd: string, _context: Context, _filename: string, callback: (err: Error | null, result: any) => void) {
        let error = null

        // remove newline char from line
        cmd = cmd.slice(0, cmd.length - 1)

        try {
            const result = this.parser.tryParse(cmd)

            if (result instanceof Cmd.Command) {
                result.execute()
            }
        } catch (e) {
            if (e instanceof Error)
                error = e
            else if (e instanceof SCError)
                error = e
        }

        callback(null, undefined)
    }

    completer(line: string) {
        var completions = 'help hello hi abc argh'.split(' ')
        var hits = completions.filter(function (c) {
            if (c.indexOf(line) == 0) {
                return c;
            }
        });
        return [hits && hits.length ? hits : completions, line];
    }

    start() {
        console.log("> Welcome to scriptsheet !")

        repl.start({
            prompt: 'scriptsheet > ',
            eval: this.eval.bind(this),
            completer: this.completer.bind(this),
            terminal: true,
            ignoreUndefined: true,
            preview: false
        })
    }
}