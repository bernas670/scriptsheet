const rows = 4, cols = 4

let table: Cell[][] = []

for (let row = 0; row < rows; row++) {
    let tmp: Cell[] = []
    for (let col = 0; col < cols; col++) {
        tmp.push({
            coords: { row: row, col: col },
            value: '',
            result: '',
            parents: [],
            children: []
        })
    }
    table.push(tmp)
}

const displayTable = (table: Cell[][]) => {

    let display: Array<Record<string,string|number>> = []
    for (let i = 0; i < table.length; i++) {
        let tmp: Record<string,string|number> = {}
        for (let j = 0; j < table[i].length; j++) {
            console.log(table[i][j])
            tmp[String.fromCharCode(65 + j)] = table[i][j].result
        }
        display.push(tmp)
    }

    console.table(display)
}

displayTable(table)