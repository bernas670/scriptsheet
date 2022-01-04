import { Formula } from "./formula";
import { setDiff } from "./utils";

export default class Cell {

    name: string
    _formula: Formula | undefined
    _result: string | number = ''
    parents: Set<Cell> = new Set<Cell>()
    children: Set<Cell> = new Set<Cell>()

    constructor(public row: number, public col: string) {
        this.name = `${col}${row}`
    }

    get result() { return this._result }

    modifyCell(value: string | number | Formula) {
        let newResult: string | number = ''

        if (value instanceof Formula) {
            this._formula = value

            // remove as child from old parents
            setDiff(this.parents, this._formula.dependsOn).forEach(c => c.children.delete(this))
            // add as child to new parents
            setDiff(this._formula.dependsOn, this.parents).forEach(c => c.children.add(this))

            this.parents = this._formula.dependsOn
            newResult = value.run(true)
        } else {
            this._formula = undefined
            this.parents.forEach(c => c.children.delete(this))
            this.parents.clear()

            newResult = isNaN(+value) ? value : Number(value)
        }

        if (this._result === newResult)
            return

        this._result = newResult

        this.children.forEach((child) => child.updateCell())
    }

    updateCell() {
        // console.log(`${this.col}${this.row} updated`)

        if (this._formula === undefined)
            return

        const newResult = this._formula.run()
        if (this._result === newResult){
            // console.log(`${this.col}${this.row}: ${newResult} === ${this._result}`)
            return
        }

        this._result = newResult
        this.children.forEach((cell) => cell.updateCell())
    }
}