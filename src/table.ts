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
    }

    getCell(row: number, col: string): Cell {
        return this.cells[row - 1][col.toUpperCase().charCodeAt(0) - 65]
    }

    checkCellRef(cell: string) {
        let row = parseInt(cell[1], 10)
        let col = cell.toUpperCase().charCodeAt(0) - 65

        return row > 0 && row <= this.rows && col >= 0 && col <= this.cols
    }
}