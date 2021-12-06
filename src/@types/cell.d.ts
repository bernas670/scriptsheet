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
