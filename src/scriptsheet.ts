import Parser from "./parser";
import Table from "./table";

import repl from "repl"
import { Context } from "vm"
import Cell from "./cell";


export default class ScriptSheet {

    table: Table
    parser: Parser

    constructor() {
        this.table = new Table(4, 4)
        this.parser = new Parser(this.table)
    }

    eval(cmd: string, _context: Context, _filename: string, callback: (err: Error | null, result: any) => void) {
        let error = null
        let result: any = "success"

        // remove newline char from cmd
        cmd = cmd.slice(0, cmd.length - 1)

        try {
            result = this.parser.tryParse(cmd)
        } catch (e) {
            if (e instanceof Error)
                error = e
        }

        this.table.display()

        callback(error, result)
    }

    completer(line: string) {


        const info = {
            commands: [
                {
                    name: "help",
                    description: "very helpful, such wow",
                }
            ],
            functions: [
                {
                    name: "sum",
                    description: "Sums the values of a range of cells",
                    function: (range: Cell[]) => {
                        
                    },
                    return_type: "sls"

                }
            ]
        }

        // if line[0] == "/"
            // look for command matches
        // else if line.includes("=")
            // check if what comes before "=" is a cell reference
            // if not cell reference
                // print error, formula is already wrong
            // else
                // 

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
        console.log("> Here are some helpful commands to get you started :")

        repl.start({
            prompt: 'scriptsheet > ',
            eval: this.eval.bind(this),
            completer: this.completer.bind(this),
            terminal: true
        })
    }
}