import Cell from './cell'
import { SCError } from './error'

/**
 * Abstract class that serves as base to implement new formulas.
 */
export abstract class Formula {

    /** Formula's dependencies */
    dependsOn: Set<Cell>

    /**
     * @constructor Create new Formula
     * @param dependsOn Formula's dependencies
     */
    constructor(dependsOn: Cell[]) {
        this.dependsOn = new Set<Cell>(dependsOn)
    }

    /**
     * Executes the formula.
     * 
     * This is the method to overload when extending Formula. Use to implement the desired operation.
     * 
     * **Warning:** do not use this method to get the formula's value.
     * Use {@link run `Formula.run()`} instead.
     * 
     * @returns formula's output
     */
    execute(): number | string {
        return ""
    }

    /**
     * Checks for cyclic dependencies.
     * 
     * Throws a `SCError` in case a cycle is detected.
     * 
     * @param cell cell that is currently being visited
     * @param visited cell's that have already been visited
     */
    isCyclic(cell: Cell | undefined, visited: Set<Cell>) {
        if (cell !== undefined && visited.has(cell)) {
            throw new SCError('#INVALID!')
        }

        for (let c of this.dependsOn) {
            if (c.formula === undefined)
                continue

            let updatedVisited = cell !== undefined ? visited.add(cell) : visited
            c.formula.isCyclic(c, updatedVisited)
        }
    }

    /**
     * Executes a formula. 
     * 
     * Catches errors thrown during the formula's execution, unlike {@link execute Formula.execute()}.
     * 
     * @param checkCycle run cyclic dependency check
     * @returns formula's output
     */
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

type ArtmOverflow = [ArithmeticOperator, Cell | Formula | number][]

export class Arithmetic extends Formula {

    args: (Cell | Formula | number)[]
    ops: ArithmeticOperator[]

    constructor(arg1: Cell | Formula | number, op: ArithmeticOperator, arg2: Cell | Formula | number, overflow: ArtmOverflow) {
        let as: Cell[] = []
        let ops: ArithmeticOperator[] = []
        let args: (Cell | Formula | number)[] = []

        let allArgs = [arg1, op, arg2, ...overflow.reduce((acc: (Cell | Formula | number | ArithmeticOperator)[], [op, arg]) => [...acc, op, arg], [])]

        for (let i = 0; i < allArgs.length; i++) {
            const arg = allArgs[i]

            if (typeof arg == 'string' && ['+', '-', '/', '*'].includes(arg)) {
                ops.push(arg)
                continue
            }

            if (arg instanceof Cell)
                as.push(arg)
            else if (arg instanceof Formula)
                as.push(...arg.dependsOn)

            args.push(arg as (Cell | Formula | number))
        }
        super(as)

        this.ops = ops
        this.args = args
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

        const evalStr: string = values.reduce((acc, value, i) => `${acc} ${value} ${i < this.ops.length ? `${this.ops[i]}` : ''}`, '')
        return eval(evalStr)
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
