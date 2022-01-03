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
}

export class Div extends Formula {
    as: Array<Cell>
    constructor(...as: Array<Cell>) { super(as); this.as = as }
}

export class Sub extends Formula {
    as: Array<Cell>
    constructor(...as: Array<Cell>) { super(as); this.as = as }
}

