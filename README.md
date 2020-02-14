# DSL for implementation of Deterministic Finite State Machines

### States must be declared beforehand!

### Transition can have an effect and it can also determine target state by executing function instead of declaring name of the state.
#### This means that you can name all actions the same and differentiate between them only by arguments and by the current state.

### Example of the use:

```javascript
const dfsm = require('./dsl').dfsm


let items = []

const automaton = dfsm`
state default CON${true ? 'NECT' : 'TROLL'}ED
state OPENED
state PROCESSED
state RESETTED

open CONNECTED -> OPENED .
add OPENED -> OPENED ${ (newItem) => items.push(newItem) } .
process OPENED -> PROCESSED ${ () => items } .
reset PROCESSED -> ${input => input === 'hard' ? 'RESETTED' : 'OPENED'} ${input => items = input === 'hard' ? [] : items} .
`
// now you can do things like:

console.log(automaton.state) // CONNECTED

automaton.open() // will execute the first action

console.log(automaton.state) // OPENED

automaton.add(23) // the second action

automaton.add(42) // the second action

console.log(automaton.state) // OPENED

console.log(automaton.process()) // the last action

console.log(automaton.state) // PROCESSED

automaton.reset('hard')

console.log(automaton.state) // RESETTED
```
