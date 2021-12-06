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

type CellCoords = {
    row: number,
    col: number
}

type Cell = {
    coords: CellCoords,
    value: string,
    result: string | number,
    parents: CellCoords[]     // cells this cell depends on
    children: CellCoords[]    // cells that depend on this cell
}

const isCyclic = (cell: Cell, visited: CellCoords[]): boolean => {

    if (visited.includes(cell.coords))
        return true

    for (let i = 0; i < cell.children.length; i++) {
        if (isCyclic(getCell(cell.children[i]), [...visited, cell.coords]))
            return true
    }

    return false
}

const Cell = (row: number, col: number): Cell => {
    return table[row][col]
}

const getCell = (coords: CellCoords): Cell => {
    return Cell(coords.row, coords.col)
}

const modifyCell = (coords: CellCoords, value: string): void => {
    const oldCell = table[coords.row][coords.col]
    const newCell = evaluateValue(oldCell, value)

    table[coords.row][coords.col] = newCell

    newCell.parents.forEach((parent) => updateParents(parent, coords))
    newCell.children.forEach((child) => updateChildren(child, coords))

    if (oldCell.result !== newCell.result) {
        newCell.children.forEach((child) => updateCellResult(child))
    }
}

// FIXME: these two functions names may be confusing
const updateParents = (parent: CellCoords, child: CellCoords) => {
    table[parent.row][parent.col].children.push(child)
}
const updateChildren = (child: CellCoords, parent: CellCoords) => {
    table[child.row][child.col].parents.push(parent)
}

const updateCellResult = (coords: CellCoords) => {
    const oldCell = table[coords.row][coords.col]
    const newCell = evaluateValue(oldCell, oldCell.value)

    table[coords.row][coords.col] = newCell

    if (oldCell.result !== newCell.result) {
        newCell.children.forEach((child) => updateCellResult(child))
    }
}

const cellRegex = /(Cell\([\s]*(\d+)[\s]*,[\s]*(\d+)[\s]*\))+/g

const evaluateValue = (oldCell: Cell, value: string): Cell => {
    let evalValue: string | number = value
    let parents = []

    if (value.charAt(0) === '=') {
        try {
            evalValue = eval(value.slice(1))

            let matches = value.match(cellRegex)
            if (matches !== null) {
                parents = matches.map((cell) => eval(`${cell}.coords`))
            }

            if (isCyclic(oldCell, parents))
                throw new Error('#CYCLE!')
        } catch (error) {
            // FIXME: there is some type error here
            // evalValue = error.message
            evalValue = '#INVALID!'
        }
    } else if (!isNaN(+value)) {
        evalValue = Number(value)
    }

    return {
        coords: oldCell.coords,
        value: value,
        result: evalValue,
        parents: parents,
        children: oldCell.children
    }
}

const Sum = (...cells: Cell[]): number => {
    return cells.reduce((acc, cell) => {
        if (typeof (cell.result) !== 'number')
            throw new Error('#INVALID!')
        return acc + cell.result
    }, 0)
}

// sum => { args, execute() => number }


const Avg = (...cells: Cell[]): number => {
    const sum = Sum(...cells)
    return sum / cells.length
}

const Concat = (...cells: Cell[]): string => {
    return cells.reduce((acc, cell) => {
        return acc + cell.result
    }, '')
}

modifyCell({ row: 0, col: 0 }, '3')
modifyCell({ row: 1, col: 1 }, '2')
console.log(Cell(0, 0))
console.log(Cell(1, 1))

modifyCell({ row: 0, col: 1 }, '=Sum(Cell(0,0), Cell(1,1))')
console.log(Cell(0, 1))
console.log(Cell(0, 0))
console.log(Cell(1, 1))

modifyCell({ row: 0, col: 0 }, '4')
console.log(Cell(0, 1))
console.log(Cell(0, 0))
console.log(Cell(1, 1))


modifyCell({ row: 3, col: 1 }, '1')
modifyCell({ row: 3, col: 2 }, '1')
modifyCell({ row: 3, col: 0 }, '=Concat(Cell(3,1), Cell(3,2))')
modifyCell({ row: 3, col: 1 }, '=Concat(Cell(3,0), Cell(3,2))')
console.log(Cell(3, 0))
console.log(Cell(3, 1))
