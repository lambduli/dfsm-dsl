const dsl = require('./dsl').dsl


let items = []

const automaton = dsl`
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
