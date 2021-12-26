import { Formula } from "./formula";

export default class Cell {

    _formula: Formula | undefined
    _result: string | number = ''
    parents: Set<Cell> = new Set<Cell>()
    children: Set<Cell> = new Set<Cell>()

    constructor(public row: number, public col: string) { }

    get result() { return this._result }

    modifyCell(value: string | number | Formula) {
        let newResult: string | number = ''

        if (value instanceof Formula) {
            this.parents.forEach((cell) => cell.children.delete(this))
            this._formula = value
            this.parents = value.dependsOn
            this.parents.forEach((cell) => cell.children.add(this))

            newResult = value.run()
        } else {
            newResult = isNaN(+value) ? value : Number(value)
        }

        if (this._result === newResult)
            return

        this._result = newResult

        this.children.forEach((child) => child.updateCell())
    }

    updateCell() {
        if (this._formula === undefined)
            return

        const newResult = this._formula.run()
        if (this._result === newResult)
            return

        this._result = newResult
        this.children.forEach((cell) => cell.updateCell())
    }
}