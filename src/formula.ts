import Cell from './cell'

export abstract class Formula {
    // private args: (Cell|string|number)[]
    // private f: Function

    // constructor(f: Function, ...args: (Cell|string|number)[]) {
    //     this.args = args
    //     this.f = f
    // }

    // FIXME: what can we do about this
    execute(): number | string {
        return ""
    }

    // getDependencies(): Cell[] {
    //     return this.args.filter((arg): arg is Cell => true)
    //     // return this.args.filter((arg: Cell) => typeof(arg) === typeof(Cell))
    // }
}

export class Sum extends Formula {
    as: Array<Cell>
    constructor(...as: Array<Cell>)  { super(); this.as = as }

    execute(): number {
        return this.as.reduce((acc, cell) => {
            if (isNaN(+cell.result)) {
                throw new Error('#INVALID!')
            }

            return Number(cell.result) + acc
        }, 0)
    }
}

export class Mul extends Formula {
    as: Array<Cell>
    constructor(...as: Array<Cell>)  { super(); this.as = as }
}

export class Div extends Formula {
    as: Array<Cell>
    constructor(...as: Array<Cell>)  { super(); this.as = as }
}

export class Sub extends Formula {
    as: Array<Cell>
    constructor(...as: Array<Cell>)  { super(); this.as = as }
}

