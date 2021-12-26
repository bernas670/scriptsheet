import Parser from "./parser";
import Table from "./table";
import * as readline from 'readline'
import { Formula } from "./formula";
import Cell from "./cell";


export default class ScriptSheet {
    
    table: Table
    parser: Parser

    constructor() {
        this.table = new Table(4,4)
        this.parser = new Parser(this.table)
    }

    start() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: "> ",
        })
        
        type InputState = 'cell' | 'formula'
        let inputState: InputState = 'cell'
        
        console.clear()
        
        rl.setPrompt("cell > ")
        this.table.display()
        rl.prompt()

        let selectedCell: Cell
        
        rl.on('line', (line) => {
            readline.moveCursor(process.stdout, 0,-1)
            if (inputState === 'cell') {
                if (this.table.checkCellRef(line)) {
                    inputState = 'formula'
                    rl.setPrompt(`f ${line.toUpperCase()} > `)

                    selectedCell = this.parser.tryParseCell(line)
                } else {
                    console.error("Not a valid cell")
                }
            } else {
                if (line.startsWith("=")) {
                    try {
                        let formula: Formula = this.parser.tryParse(line.slice(1))
                        selectedCell.modifyCell(formula)
                        inputState = 'cell'
                        rl.setPrompt("cell > ")
                        console.clear()
                        this.table.display()
                    } catch (error) {
                        console.error(error)
                    }
                } else {
                    inputState = 'cell'
                    rl.setPrompt("cell > ")
                    console.clear()
                    selectedCell.modifyCell(line)
                    this.table.display()
                }
            }
            rl.prompt()
        })
    }
    
}