import Cell from './cell'

export default class Table {

    cells: Cell[][] = []

    constructor(public rows: number, public cols: number) {
        for (let i = 0; i <= rows; i++) {
            let tmpRow: Cell[] = []
            for (let j = 0; j < cols; j++) {
                tmpRow.push(new Cell(i + 1, String.fromCharCode(65+j)))
            }
            this.cells.push(tmpRow)
        }
    }

    display(): void {
        let display: Array<Record<string, string | number>> = []
        for (let i = 0; i < this.cells.length; i++) {
            let tmp: Record<string, string | number> = {}
            for (let j = 0; j < this.cells[i].length; j++) {
                tmp[String.fromCharCode(65 + j)] = this.cells[i][j].result
            }
            display.push(tmp)
        }
    
        console.table(display)  
    }

    getCell(row: number, col: string): Cell {
        return this.cells[row - 1][col.toUpperCase().charCodeAt(0) - 65]
    }

    checkCellRef(cell: string) {
        let row = parseInt(cell[1], 10) - 1
        let col = cell.toUpperCase().charCodeAt(0) - 65

        return row >= 0 && row < this.rows && col >= 0 && col <= this.cols
    }
}