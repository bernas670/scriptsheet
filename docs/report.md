# Scriptsheet

This project was developed for the [Advanced Software Construction Techniques](https://sigarra.up.pt/feup/en/UCURR_GERAL.FICHA_UC_VIEW?pv_ocorrencia_id=486296) course at FEUP, under the guidance of Professor [Hugo Sereno](https://github.com/hugoferreira).

We set out to develop a spreadsheet, however, the main focus of the project was to apply the techniques we learned during the lectures and reflect upon the following questions:
 1. How are expressions evaluated/computed?
 2. What cells are computed first?
 3. Does the entire spreadsheet need to update when a cell changes?
 4. Can we optimize the spreadsheet to generate code for each cell instead of interpreting its expression everytime something is modified?

## Project Development
### First Working Version
A couple weeks into development we reached our [first working version](https://github.com/bernas670/scriptsheet/blob/e2a821ff4fadcda1ddacadbb1be6bbe698c9e452/src/spreadscript.ts) of *Scriptsheet*. This version has no UI, because at the time we had just decided to stop using ReactJS and had started build a [REPL](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop) in the command-line.
In this version we had already tackled some of the aforementioned questions.

#### Formula Implementation and Expression Evaluation
Having just learned about javascript's [`eval`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval) function, we figured we would give it a try as the way to evaluate our expressions. We completely ignored all security concerns, as this was just a proof of concept, and got to work.

Each cell had a `value` field that either contained a string or a number, if the string began with an '=' it was considered a formula and the string, without the first character, was evaluated with `eval`.

We ended up implementing formulas as functions, like so:
```typescript
const Sum = (...cells: Cell[]): number => {
    return cells.reduce((acc, cell) => {
        if (typeof (cell.result) !== 'number')
            throw new Error('#INVALID!')
        return acc + cell.result
    }, 0)
}
```

One key problem of this approach is that everytime a parent cell changes its value, the expression needs to be re-evaluated, instead of just having to execute the formula again. Another slightly annoying issue is that this way our syntax could never have been similar to that of Excel.

#### Cell Dependencies
This version also features cell dependencies, however this feature was implemented in a sub-optimal way. We created a regular expression, `cellRegex`, to match the `Cell` function call and when evaluating the cell's formula we matched the string being evaluated with the regex and added those cells as parents.

```typescript
const cellRegex = /(Cell\([\s]*(\d+)[\s]*,[\s]*(\d+)[\s]*\))+/g

const Cell = (row: number, col: number): Cell => {
    return table[row][col]
}
```
Now that we had each cell's `parents` and `children`, we were able to make it so that **whenever a cell updates and its `result` changes**, each child is updated, it then propagates that update to its children, and so on. 

#### Detecting Cyclic Dependencies
Even though our implementation for identifying cell dependencies wasn't the best, we had all the necessary information to look for cyclic dependencies that would cause infinite update loops, therefore breaking the spreadsheet.
The algorithm is quite simple, it's a pretty standard depth first search.
```typescript
const isCyclic = (cell: Cell, visited: CellCoords[]): boolean => {
    if (visited.includes(cell.coords))
        return true
    for (let i = 0; i < cell.children.length; i++) {
        if (isCyclic(getCell(cell.children[i]), [...visited, cell.coords]))
            return true
    }
    return false
}
```
We run this check everytime the cell expression is evaluated.

### Final Product
A lot changed from our first working version to the [final product](https://github.com/bernas670/scriptsheet/tree/9bddba3309d960fa7dfd83bb8fac45d709b3da43). The REPL is implemented using Node's [repl module](https://nodejs.org/api/repl.html).
The most significant improvements are, without a doubt, the way we evaluate expressions and our formula implementation.

#### Expression Evalutation
In one of the lectures we learned about [parser combinators](https://en.wikipedia.org/wiki/Parser_combinator), namely [parsimmon](https://github.com/jneen/parsimmon). We immediately saw this small library's potential to solve one of our main problems, how expressions were evaluated.

We encountered a problem when creating the parser for arithmetic expressions. The first version of the parser accepted only two operands, that could either be a number or a cell. But this was not enough, we wanted this operation to allow any number of operands and to support formulas. Thus we came up with this parser implementation:

```typescript
 formula: l => alt(l.artm, l.if, l.sum, l.mul, l.div, l.sub, l.avg, l.cellRef),

 artm: l => seq(alt(l.cell, l.number, l.formula),
                P.regexp(/\+|-|\*|\//), 
                alt(l.cell, l.number, l.formula))
                .map(([arg1, op, arg2]) => new F.Arithmetic(arg1, op, arg2)),
```
We overlooked a key detail though, [left recursion](https://en.wikipedia.org/wiki/Left_recursion). An infinite loop was created everytime we tried to parse a formula, which obviously broke the program.
Initially we tried to solve this problem using lookaheads, but due to lack of documentation and resources about parsimmon we gave up on the idea. We got to thinking and ended up with an even better solution, that best fits the parsimmon rationale:
```typescript
 formula: l => alt(l.artm, l.if, l.sum, l.mul, l.div, l.sub, l.avg, l.cellRef),
 lhFormula: l => alt(l.if, l.sum, l.mul, l.div, l.sub, l.avg, l.cellRef),

 artm: l => seq(alt(l.cell, l.lhFormula, l.number),
                l.arithmeticOp, alt(l.cell, l.lhFormula, l.number),
                seq(l.arithmeticOp, alt(l.cell, l.lhFormula, l.number)).many())
                .map(([arg1, op, arg2, overflow]) => new F.Arithmetic(arg1, op, arg2, overflow)),
``` 


#### Formula Implementation
Dropping the old method of evaluating expressions and using parsimmon allowed us to improve our solution in many ways. 
Formulas are now classes, we created an abstract class [`Formula`](https://github.com/bernas670/scriptsheet/blob/9bddba3309d960fa7dfd83bb8fac45d709b3da43/src/formula.ts#L7) that serves as a base for all other formulas. To create a new formula we simply extend this class and overload the [`execute`](https://github.com/bernas670/scriptsheet/blob/9bddba3309d960fa7dfd83bb8fac45d709b3da43/src/formula.ts#L30) method to perform the desired operation. Here is the implementation of sum, as an example:
```typescript
export class Sum extends Formula {
    as: Cell[]
    constructor(...as: Cell[]) { super(as); this.as = as }

    execute(): number {
        return this.as.reduce((acc, cell) => {
            if (isNaN(+cell.result)) {
                throw new SCError('#INVALID!')
            }

            return Number(cell.result) + acc
        }, 0)
    }
}
```

In the above formula a [`SCError`](https://github.com/bernas670/scriptsheet/blob/9bddba3309d960fa7dfd83bb8fac45d709b3da43/src/error.ts), our custom error, is thrown whenever a cell value is not numeric. But these errors need to be caught somewhere, that is why we wrapped `execute` with the `run` method, which is the method to use when trying to obtain a formula's result. This method is also responsible for running the cyclic dependency check.

#### Cell Dependencies
Having implemented formulas as classes we are now able to simply keep a list of what cells the formula depends on in a class attribute. Keep in mind that all dependency "lists" are in fact implemented with `Set` to avoid duplication.

Initially, when a `Formula` was assigned to a cell we just iterated through **all** the cell's parents, removed the reference to the cell, then substitute the parent's list and add the cell as child to the new parents. Now, the difference between the old parents and the new parents is computed, with `setDiff`, and no references that are deleted are then added again.

```typescript
function setDiff<T>(a: Set<T>, b: Set<T>) {
    return new Set<T>([...a].filter(e => !b.has(e)))
}
```

#### Cyclic Dependencies
When it comes to cyclic dependency there were no big improvements, the algorithm stayed pretty much the same. The greatest difference is that a `SCError` is thrown when a cycle is detected.

## Conclusion
We set out to create a spreadsheet and that is exactly what we did. We took into consideration all the questions proposed and were able to answer them all with, what we believe to be, good solutions that required the application of the knowledge we acquired during the lectures throughout this semester.

## Future Work
This was a very interesting project to work on, and even though our work for the course is done, there is still a lot of room for improvements and new features. Some of the following ideas were not implemented due to time constraints and some others because we felt like they were not really relevant when it came to the course's objectives.

So here is the list:
- add the possibility for users to view and edit cell values without having to fully rewrite the expression
- improve error handling and error messages, to give users a better idea of what is the cause of the issue
- expand *Scriptsheet*'s formula library (ex: `MIN`, `MAX`, `COUNT`, `TYPE`, `SUMIF`)
- save and load features
- document formulas, so that the user has a detailed description of what the formula does and what arguments it takes
- context based autocomplete/suggestions
- constant optimizations in formulas (ex: `if(1<3, "a", "b")`, condition should not be evaluated everytime because it's constant)


