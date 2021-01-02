const dfsm = require('./dsl')


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


// let factorial = null
let factorial = dfsm`
state default INIT

compute
  INIT -> ${(state, num) => num === 0 ? '1' : `${num}`}
    ${(state, num) => num === 0 ? undefined : factorial.compute(num - 1)} .

compute
  ${state => state === 'INIT' ? 'NO' : state} ->
    ${(state, num) => num === 0 ? state : `${Number(state) * num}`}

    ${(state, num) => num === 0 ? state : factorial.compute(num - 1)} .
`

factorial.compute(5)
console.log(factorial.state)
