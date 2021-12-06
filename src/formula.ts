export default class Formula {
    private args: (Cell|string|number)[]
    private f: Function

    constructor(f: Function, ...args: (Cell|string|number)[]) {
        this.args = args
        this.f = f
    }

    execute() {
        this.f(...this.args)
    }

    getDependencies(): Cell[] {
        return this.args.filter((arg): arg is Cell => true)
        // return this.args.filter((arg: Cell) => typeof(arg) === typeof(Cell))
    }
}