import Cell from './cell'
import { SCError } from './error'

export abstract class Formula {

    dependsOn: Set<Cell>
    constructor(dependsOn: Cell[]) {
        this.dependsOn = new Set<Cell>(dependsOn)
    }

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

    args: (Cell | Formula | number)[]

    constructor(arg1: Cell | Formula | number, public op: ArithmeticOperator, arg2: Cell | Formula | number) {
        let as: Cell[] = []
        for (let i = 0; i < arguments.length; i++) {
            const arg = arguments[i]

            if (arg instanceof Cell)
                as.push(arg)
            else if (arg instanceof Formula)
                as.push(...arg.dependsOn)
        }
        super(as)

        this.args = [arg1, arg2]
    }

    execute(): number {
        const values: number[] = this.args.map(arg => {
            let value: number | string

            if (arg instanceof Cell)
                value = arg.result
            else if (arg instanceof Formula)
                value = arg.run()
            else
                value = arg

            if (typeof value != "number")
                throw new SCError('#INVALID!')

            return value
        })

        return eval(`${values[0]} ${this.op} ${values[1]}`)
    }
}

export type IfArg = string | number | Cell | Formula

export class If extends Formula {

    args: IfArg[]
    outs: IfArg[]

    constructor(arg1: IfArg, public op: BooleanOperator, arg2: IfArg, out1: IfArg, out2: IfArg) {
        let as: Cell[] = []
        for (let i = 0; i < arguments.length; i++) {
            const arg = arguments[i]

            if (arg instanceof Cell)
                as.push(arg)
            else if (arg instanceof Formula)
                as.push(...arg.dependsOn)
        }
        super(as)

        this.args = [arg1, arg2]
        this.outs = [out1, out2]
    }

    execute(): string | number {
        const vals: (string | number)[] = this.args.map(arg => this.getArgValue(arg))
        const result = eval(`"${vals[0]}" ${this.op} "${vals[1]}"`)
        const output = result ? this.outs[0] : this.outs[1]

        return this.getArgValue(output)
    }

    getArgValue(arg: IfArg): string | number {
        if (arg instanceof Cell)
            return arg.result
        else if (arg instanceof Formula)
            return arg.run()
        return arg
    }
}
