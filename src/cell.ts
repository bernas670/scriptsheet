import { Formula } from "./formula";

export default class Cell extends Formula {

    _formula: Formula | undefined
    _result: string | number = ''
    parents: Cell[] = []
    children: Cell[] = []

    constructor(public row: number, public col: string) { super() }

    set formula(value: Formula) {
        this._formula = value

        try {
            this._result = value.execute()
        } catch (error) {
            if (error instanceof Error)
                this._result = error.message
        }
    }

    set result(value: string | number) {
        this._result = isNaN(+value) ? value : Number(value)
    }

    get result() {
        return this._result
    }
}