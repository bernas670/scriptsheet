import Cell from "./Cell"

type RowProps = {
    index: number       // row index
    cols: number        // number of columns
    data: string[]

    handleEditCell: (row: number, col: number, value: string) => void
    handleChangedCells: (row: number, col: number, value: string) => void
    updateCells: () => void
}

const Row = (props: RowProps) => {
    let cells: JSX.Element[] = [
        <th>{props.index + 1}</th>
    ]

    for (let i = 0; i < props.cols; i++) {
        cells.push(
            // TODO: change this
            <td>
                <Cell
                    row={props.index}
                    col={i}
                    value={props.data[i]}
                    handleEditCell={props.handleEditCell}
                    onChangedValue={props.handleChangedCells}
                    updateCells={props.updateCells}
                />
            </td>
        )
    }
    return <tr>{cells}</tr>
}

export default Row