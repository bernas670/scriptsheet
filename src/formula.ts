import Cell from './cell'
import { SCError } from './error'

export abstract class Formula {

    dependsOn: Set<Cell>
    constructor(dependsOn: Cell[]) {
        this.dependsOn = new Set<Cell>(dependsOn)
    }

    // FIXME: what can we do about this
    execute(): number | string {
        return ""
    }

    isCyclic(cell: Cell | undefined, visited: Set<Cell>) {
        if (cell !== undefined && visited.has(cell)) {
            throw new SCError('#INVALID!')
        }

        for (let c of this.dependsOn) {
            if (c._formula === undefined)
                continue

            let updatedVisited = cell !== undefined ? visited.add(cell) : visited
            c._formula.isCyclic(c, updatedVisited)
        }
    }

    run(checkCycle = false): number | string {
        let result: number | string = ''

        try {
            if (checkCycle) this.isCyclic(undefined, new Set<Cell>())
            result = this.execute()
        } catch (error) {
            if (error instanceof SCError) {
                result = error.message
            } else {
                console.error(error)
            }
        }

        return result
    }
}

export class CellReference extends Formula {
    constructor(public cell: Cell) { super([cell]) }

    execute(): number | string { return this.cell.result }
}

export class Sum extends Formula {
    as: Array<Cell>
    constructor(...as: Array<Cell>) { super(as); this.as = as }

    execute(): number {
        return this.as.reduce((acc, cell) => {
            if (isNaN(+cell.result)) {
                throw new SCError('#INVALID!')
            }

            return Number(cell.result) + acc
        }, 0)
    }
}

export class Mul extends Formula {
    as: Array<Cell>
    constructor(...as: Array<Cell>) { super(as); this.as = as }

    execute(): number {
        return this.as.reduce((acc, cell) => {
            if (isNaN(+cell.result)) {
                throw new SCError('#INVALID!')
            }

            return Number(cell.result) * acc
        }, 0)
    }
}

export class Div extends Formula {
    as: Array<Cell>
    constructor(...as: Array<Cell>) { super(as); this.as = as }

    execute(): number {
        return this.as.reduce((acc, cell) => {
            if (isNaN(+cell.result)) {
                throw new SCError('#INVALID!')
            }

            return Number(cell.result) / acc
        }, 0)
    }
}

export class Sub extends Formula {
    as: Array<Cell>
    constructor(...as: Array<Cell>) { super(as); this.as = as }

    execute(): number {
        return this.as.reduce((acc, cell) => {
            if (isNaN(+cell.result)) {
                throw new SCError('#INVALID!')
            }

            return Number(cell.result) - acc
        }, 0)
    }
}

export class Avrg extends Formula {
    as: Array<Cell>
    constructor(...as: Array<Cell>) { super(as); this.as = as }

    execute(): number {
        return this.as.reduce((acc, cell) => {
            if (isNaN(+cell.result)) {
                throw new SCError('#INVALID!')
            }

            return Number(cell.result) + acc
        }, 0) / this.as.length
    }
}

export class Arithmetic extends Formula {

    constructor(public arg1: Cell | number | Formula, public op: String, public arg2: Cell | number | Formula) {
        let as: Array<Cell> = []
        if (arg1 instanceof Cell) as.push(arg1)
        if (arg2 instanceof Cell) as.push(arg2)
        if (arg1 instanceof Formula) {
            let aux: Formula = arg1 as Formula
        
                for(let cell of aux.dependsOn) {
                    as.push(cell)
                }
        }
        if (arg2 instanceof Formula) {
            let aux: Formula = arg1 as Formula
        
                for(let cell of aux.dependsOn) {
                    as.push(cell)
                }
        }

        super(as)
    }

    execute(): number {
        let value1: number
        let value2: number

        if (this.arg1 instanceof Cell) {
            if (isNaN(+this.arg1.result)) {
                throw new SCError('#INVALID!')
            }
            value1 = this.arg1.result as number
        } else if(this.arg1 instanceof Formula) {
            value1 = this.arg1.execute() as number
        } else value1 = this.arg1

        if (this.arg2 instanceof Cell) {
            if (isNaN(+this.arg2.result)) {
                throw new SCError('#INVALID!')
            }
            value2 = this.arg2.result as number
        } else if(this.arg2 instanceof Formula) {
            value2 = this.arg2.execute() as number
        } else value2 = this.arg2


        return eval(value1.toString() + ' ' + this.op + ' ' + value2.toString());
    }
}
