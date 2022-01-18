import { Formula } from "./formula";
import { setDiff } from "./utils/set";


/**
 * This class represents a spreadsheet cell
 */
export default class Cell {

    /** Cell's label *(ex: A1)* */
    name: string
    /** Formula assigned to this cell. `undefined` when cell has a static value */
    formula: Formula | undefined
    /** Current cell value. Either `formula`'s result or static */
    result: string | number = ''
    /** Cells that this cell depends on */
    parents: Set<Cell> = new Set<Cell>()
    /** Cells that depend on this cell */
    children: Set<Cell> = new Set<Cell>()

    /**
     * @constructor
     * 
     * @param row cell's row index *(ex: 1)*
     * @param col cell's column label *(ex: A)*
     */
    constructor(public row: number, public col: string) {
        this.name = `${col}${row}`
    }

    /**
     * Called to change cell's value or formula.
     * 
     * When `formula` is modified, `parents` and `children` are updated 
     * and a cyclic dependency check is run.
     * 
     * `children` are only updated when `result` changes
     * 
     * @param value new cell value
     */
    modifyCell(value: string | number | Formula) {
        let newResult: string | number = ''

        if (value instanceof Formula) {
            this.formula = value

            // remove as child from old parents
            setDiff(this.parents, this.formula.dependsOn).forEach(c => c.children.delete(this))
            // add as child to new parents
            setDiff(this.formula.dependsOn, this.parents).forEach(c => c.children.add(this))

            this.parents = this.formula.dependsOn
            newResult = value.run(true)
        } else {
            this.formula = undefined
            this.parents.forEach(c => c.children.delete(this))
            this.parents.clear()

            newResult = isNaN(+value) ? value : Number(value)
        }

        if (this.result === newResult)
            return

        this.result = newResult

        this.children.forEach((child) => child.updateCell())
    }

    /**
     * Updates cell's `result` and signals `children` to update.
     * 
     * Called when one of the cell's `parents`'s `result` changes.
     */
    updateCell() {
        if (this.formula === undefined)
            return

        const newResult = this.formula.run()
        if (this.result === newResult){
            return
        }

        this.result = newResult
        this.children.forEach((cell) => cell.updateCell())
    }
}