import './Cell.css'

import { ChangeEvent, Component, DetailedHTMLProps, InputHTMLAttributes } from "react"



interface CellProps {
    row: number,
    col: number,
    value: string,

    handleEditCell: (row: number, col: number, value: string) => void
    onChangedValue: (row: number, col: number, value: string) => void
    updateCells: () => void
}

interface CellState {
    value: string
    editing: boolean
    selected: boolean
}

export default class Cell extends Component<CellProps, CellState> {
    // value to be displayed
    display: string = ''

    // used for click and double click
    timer: number = 0
    delay: number = 200
    prevent: boolean = false

    constructor(props: CellProps) {
        super(props)

        this.state = {
            value: props.value,
            editing: false,
            selected: false
        }

        this.display = this.determineValue(props.row, props.col, props.value)
    }

    componentDidMount() {
        window.document.addEventListener('unselectAll', this.handleUnselectAll)
    }

    componentWillUnmount() {
        window.document.removeEventListener('unselectAll', this.handleUnselectAll)
    }

    handleUnselectAll = () => {
        if (this.state.selected || this.state.editing) {
            this.setState({ selected: false, editing: false })
        }
    }

    emitUnselectAllEvent = () => {
        const e = new Event('unselectAll')
        window.document.dispatchEvent(e)
    }

    // before updating, execute formula to recalculate display value
    // useful when editing another cell that this one depends on
    getSnapshotBeforeUpdate() {
        this.display = this.determineValue(this.props.row, this.props.col, this.state.value)
    }

    onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue: string = e.target.value

        this.setState({ value: newValue })
        this.display = this.determineValue(this.props.row, this.props.col, newValue)
        this.props.handleEditCell(this.props.row, this.props.col, newValue)
    }

    onBlur = (e: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) => {
        this.setState({ selected: false })
        this.hasNewValue()
    }

    onKeyPressInput = (e: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) => {
        if (e.key === 'Enter') {
            this.hasNewValue()
        }
    }

    hasNewValue = () => {
        this.setState({ editing: false })

        this.props.onChangedValue(this.props.row, this.props.col, this.display)
        // TODO: handle new value
    }

    determineValue = (x: number, y: number, value: string) => {
        // TODO: check if the value is a formula or not

        return value
    }

    onClick = () => {
        this.timer = window.setTimeout(() => {
            if (!this.prevent) {
                this.emitUnselectAllEvent()
                this.setState({ selected: true })
            }
            this.prevent = false
        }, this.delay)
    }

    onDoubleClick = () => {
        clearTimeout(this.timer)
        this.prevent = true
        this.emitUnselectAllEvent()
        this.setState({ editing: true, selected: true })
    }

    render() {

        if (this.state.selected) {

        }

        if (this.state.editing) {
            return <input
                type="text"
                onKeyPress={this.onKeyPressInput}
                onChange={this.onChange}
                onBlur={this.onBlur}
                value={this.state.value}
                autoFocus
            />
        }

        return <span
            className={`col-${this.props.col} row-${this.props.row}`}
            onClick={this.onClick}
            onDoubleClick={this.onDoubleClick}
        >
            {this.props.value}
        </span>
    }
}
