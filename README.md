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

add
  OPENED -> OPENED
    ${ (s, newItem) => items.push(newItem) } .

process
  OPENED -> PROCESSED
    ${ () => items } .

reset
  PROCESSED -> ${(s, input) => input === 'hard' ? 'RESETTED' : 'OPENED'}
    ${(s, input) => items = input === 'hard' ? [] : items} .
`
// now you can do things like:

console.log(automaton.state) // CONNECTED

automaton.open() // will execute the first action

console.log(automaton.state) // OPENED

automaton.add(23) // the second action

automaton.add(42) // the second action

console.log(automaton.state) // OPENED

console.log(automaton.process()) // the third action

console.log(automaton.state) // PROCESSED

automaton.reset('hard') // the last action

console.log(automaton.state) // RESETTED
```

### Each lambda function given to DFSM is called with current state and the sequence of the arguments given to the method


#### More complicated example:

```javascript
const dfsm = require('./dsl').dfsm


let factorial = null
factorial = dfsm`
state default INIT

call
  INIT -> ${(state, num) => num === 0 ? '1' : `${num}`}
    ${(state, num) => num === 0 ? undefined : factorial.call(num - 1)} .

call
  ${state => state === 'INIT' ? 'NO' : state} -> ${(state, num) => num === 0 ? state : `${Number(state) * num}`}
    ${(state, num) => num === 0 ? state : factorial.call(num - 1)} .
`

factorial.call(5)
console.log(factorial.state) // 120
```

As you can see you can define single transition multiple times - only condition is: `It has to be Deterministic`.

This means that as long as you don't create two or more transitions of the same name starting from the same state you are good to go.

You can also pass function instead of the string for the `FROM` state in the transition declaration. This is helpful if you want to create states on the go and do not want to, or can't, register them at the begining of the declaration.
If the function `from` returns string not equal to the current state - no further evaluation for this transition is going to happen.
