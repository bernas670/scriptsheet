import Cell from './cell'
import * as F from './formula'
import Table from './table'

export abstract class Command {
    constructor() { }
    execute() { }
}

export class Assign extends Command {
    constructor(public table: Table, public cell: Cell, public value: string | number | F.Formula) {
        super()
    }

    execute() {
        this.cell.modifyCell(this.value)
        this.table.display()
    }
}

export class Help extends Command {
    constructor() { super() }

    execute() {
        console.log("such help, much wow :)")
    }
}

export class DisplayDependencies extends Command {
    constructor(public table: Table) { super() }

    execute() {
        this.table.displayDependencies()
    }
}

export class DisplayTable extends Command {
    constructor(public table: Table) { super() }

    execute(): void {
        this.table.display()
    }
}

export class Clear extends Command {
    constructor() { super() }
    execute(): void {
        console.clear()
    }
}