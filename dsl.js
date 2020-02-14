function dfsm (strings, ...values) {
  let states = [];
  let transitions = [];
  let program = join(strings, values);

  ([states, transitions, program] = parse(program));

  const automaton = {}
  
  automaton.state = defaultState(states)
  Object.assign(automaton, actionize(transitions, automaton))

  return automaton
}

function join ([str, ...strs], [val, ...vals]) {
  if (strs.length === 0 && vals.length === 0) return [str, val]
  if (strs.length === 0) return [str, val, ...vals]
  if (vals.length === 0) return [str, val, ...strs]
  return [str, val, ...join(strs, vals)]
}

function actionize (transitions, automaton) {
  const actions = {}

  transitions.forEach(transition => {
    const {name, from, to, effect} = transition
    actions[name] = (...args) => {
      if (automaton.state !== from) return

      const newState = typeof to === 'function' ? to(...args) : to
      automaton.state = newState
      return typeof effect === 'function' ? effect(...args) : undefined
    }
  })

  return actions
}

function parse (program) {
  let states = null;
  let transitions = null;
  ([states, program] = parseStates(program));
  ([transitions, program] = parseTransitions(program));

  return [states, transitions, program]
}

function parseStates (program) {
  let isDefault = false
  let name = ''

  try {
    program = readStateKw(program);
    ([isDefault, program] = readDefaultKw(program));
  
    ([name, program] = readStateName(program));
    
    ([states, program] = parseStates(program));

    return [[{default: isDefault, name}, ...states], program]
  }
  catch (ex) {
    return [[], program]
  }
}

function parseTransitions (program) {
  let name = '';
  let from = '';
  let to = '';
  let effect = null;

  try {
    ([name, program] = readTransitionName(program));
    ([from, program] = readStateName(program));
    (program = readArrow(program));
    try {
      ([to, program] = readStateName(program));
    }
    catch (ex) {
      ([to, program] = readEffect(program));
    }
    try {
      ([effect, program] = readEffect(program));
    }
    catch (ex) {
      // nothing - transitions does'not need to have an effect
    }
    (program = readDot(program));
    
    ([transitions, program] = parseTransitions(program))
    return [[{name, from, to, effect}, ...transitions ], program]
  }
  catch (ex) {
    return [[], program]
  }
  
}

function readTransitionName ([statement, ...program]) {
  if (typeof statement !== 'string') {
    throw new Error(`Syntax Error: Expected _transition_name_ to be string but got ${statement}`)
  }
  statement = statement.trimLeft();
  return munchLowerChars([statement, ...program])
}

function readStateKw ([statement ,...program]) {
  if (typeof statement !== 'string') {
    throw new Error(`Syntax Error: Expected keyword _state_ but got ${statement}`)
  }

  statement = statement.trimLeft()
  if (statement.indexOf('state') !== 0) {
    throw new Error(`Expected keyword _state_ but got ${statement}`)
  }

  return [statement.slice(5) ,...program]
}

function readDefaultKw ([statement ,...program]) {
  if (typeof statement !== 'string') {
    throw new Error(`Syntax Error: Unexpected token ${statement}`)
  }

  statement = statement.trimLeft()
  if (statement.indexOf('default') === 0) {
    return [true, [statement.slice(7) ,...program]]
  }

  return [false, [statement ,...program]]
}

function readStateName ([statement, ...program]) {
  if (typeof statement !== 'string') {
    throw new Error(`Syntax Error: Expected _state_name_ but got ${statement}`)
  }

  statement = statement.trimLeft()
  if (statement.length === 0) return readStateName(program)

  return munchUpperChar([statement, ...program])
}

function readArrow ([statement, ...program]) {
  if (typeof statement !== 'string') {
    throw new Error(`Syntax Error: Expected symbol -> but got ${statement}`)
  }

  statement = statement.trimLeft()
  if (statement.length === 0) return readArrow(program)
  if (statement.indexOf('->') !== 0) {
    throw new Error(`Syntax Error: Expected symbol -> but got ${statement}`)
  }

  return [statement.slice(2), ...program]
}

function readDot ([statement, ...program]) {
  if (typeof statement !== 'string') {
    throw new Error(`Syntax Error: Expected symbol . but got ${statement}`)
  }

  statement = statement.trimLeft()
  if (statement.length === 0) return readDot(program)
  if (statement.indexOf('.') !== 0) {
    throw new Error(`Syntax Error: Expected symbol . but got ${statement}`)
  }

  return [statement.slice(2), ...program]
}

function readEffect ([statement, ...program]) {
  if (typeof statement === 'string') {
    statement = statement.trimLeft()
    if (statement.length === 0) {
      return readEffect(program)
    }
  }

  if (typeof statement !== 'function') {
    throw new Error(`Syntax Error: expected effect to have type function but got ${statement}`)
  }

  return [statement, program]
}

function munchUpperChar (program) {
  program = [...program]
  const name = []
  while (program.length) {
    str = program.shift()

    if (typeof str !== 'string') {
      throw new Error(`Sytax Error: Expected state _name_ to be all upper-case letters in ${name.join('')}`)
    }

    while (str) {
      if (str[0] >= 'A' && str[0] <= 'Z') {
        name.push(str[0])
        str = str.slice(1)
      }
      else {
        return [name.join(''), [str, ...program]]
      }
    }
  }
  return [name.join(''), program]
}

function munchLowerChars (program) {
  program = [...program]
  const name = []
  while (program.length) {
    str = program.shift()

    if (typeof str !== 'string') {
      throw new Error(`Sytax Error: Expected state _name_ to be all upper-case letters in ${name.join('')}`)
    }

    while (str) {
      if (str[0] >= 'a' && str[0] <= 'z') {
        name.push(str[0])
        str = str.slice(1)
      }
      else {
        return [name.join(''), [str, ...program]]
      }
    }
  }
  return [name.join(''), program]
}

function defaultState (states) {
  const defaults = states.filter(state => state.default)
  if (defaults.length === 1) {
    return defaults[0].name
  }
  else {
    throw new Error(`Type Error: Only one state can be default but you have these: ${defaults.map(state => state.name).join(', ')}`)
  }
}

module.exports = {
  dfsm,
}