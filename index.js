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
console.log(factorial.state)
