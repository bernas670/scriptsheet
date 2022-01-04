import Cell from './cell'

export default class Table {

    cells: Cell[][] = []

    constructor(public rows: number, public cols: number) {
        for (let row = 1; row <= rows; row++) {
            let tmpRow: Cell[] = []
            for (let i = 0; i < cols; i++) {
                let col = String.fromCharCode(65 + i)
                tmpRow.push(new Cell(row, col))
            }
            this.cells.push(tmpRow)
        }
    }

    display(): void {
        let display: Record<number, Record<string, string | number>> = {}
        for (let i = 0; i < this.cells.length; i++) {
            let tmp: Record<string, string | number> = {}
            for (let j = 0; j < this.cells[i].length; j++) {
                tmp[String.fromCharCode(65 + j)] = this.cells[i][j].result
            }
            display[i+1] = tmp
        }
    
        console.table(display)
        this.displayDependencies()
    }

    displayDependencies(): void {
        let display: Record<string, {Parents: string[], Children: string[]}> = {}
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let cell = this.cells[i][j]

                if (cell.parents.size === 0 && cell.children.size === 0)
                    continue

                display[cell.name] = {
                    Parents: [...cell.parents].map(c => c.name), 
                    Children: [...cell.children].map(c => c.name)
                }
            }
        }
        
        console.table(display)
    }

    getCell(row: number, col: string): Cell {
        return this.cells[row - 1][col.toUpperCase().charCodeAt(0) - 65]
    }

    getRange(start: {row: number, col: string}, end: {row: number, col: string}): Cell[] {
        let result: Cell[] = []

        let startCol = start.col.toUpperCase().charCodeAt(0) - 65
        let endCol = end.col.toUpperCase().charCodeAt(0) - 65

        for (let row = start.row; row <= end.row; row++) {
            for (let col = startCol; col <= endCol; col++) {
                result.push(this.cells[row - 1][col])
            }
        }
        
        return result
    }

    checkCellRef(cell: string) {
        let row = parseInt(cell[1], 10)
        let col = cell.toUpperCase().charCodeAt(0) - 65

        return row > 0 && row <= this.rows && col >= 0 && col <= this.cols
    }
}