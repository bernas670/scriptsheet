import './Table.css'

import { Component } from 'react';
import Row from "./Row";



interface TableProps {
    cols: number,
    rows: number
}

interface TableState {
    data: string[][]   // TODO: change this

    cell: string
    formula: string
}

export default class Table extends Component<TableProps, TableState> {
    constructor(props: TableProps) {
        super(props)

        let data: string[][] = []
        for (let i = 0; i < props.cols; i++) {
            let a: string[] = []
            for (let j = 0; j < props.rows; j++) {
                a.push('')
            }
            data.push(a)
        }

        this.state = {
            data: data,
            cell: '',
            formula: ''
        }
    }

    handleEditCell = (row: number, col: number, value: string) => {
        const cell: string = String.fromCharCode(65 + col) + (row + 1)
        this.setState({ cell: cell, formula: value })
    }

    handleChangedCell = (row: number, col: number, value: string) => {
        const modifiedData = this.state.data.slice()
        modifiedData[row][col] = value
        this.setState({ data: modifiedData })
    }

    updateCells = () => {
        this.forceUpdate()
    }

    executeFormula = (row: number, col: number, formula: string) => {   
        return eval(formula)
    }

    render() {
        let tableRows: JSX.Element[] = []

        let tableIdRow: JSX.Element[] = [<th className="col-0 row-0"></th>]

        for (let i = 1; i <= this.props.rows; i++) {
            tableIdRow.push(<th>{String.fromCharCode(64 + i)}</th>)
        }

        tableRows.push(<tr>{tableIdRow}</tr>)

        for (let i = 0; i < this.props.rows; i++) {
            tableRows.push(
                <Row
                    index={i}
                    cols={this.props.cols}
                    data={this.state.data[i] || []}
                    handleEditCell={this.handleEditCell}
                    handleChangedCells={this.handleChangedCell}
                    updateCells={this.updateCells}
                    executeFormula={this.executeFormula}
                />
            )
        }

        return <>
            <div id="formula-bar">
                <span>{this.state.cell}</span>
                <input value={this.state.formula} />
            </div>
            <table>{tableRows}</table>
        </>
    }
}

