export const mainMenuPrompts = [
  {
    type: 'select',
    name: 'action',
    message: 'Choose an action',
    choices: [
      { title: 'Clock In', value: 'clock-in' },
      { title: 'Add custom time entry', value: 'custom-entry' },
      { title: 'Setup', value: 'setup' },
      { title: 'Check status of current week', value: 'status' },
      { title: 'Exit', value: 'exit' }
    ]
  },
  {
    type: prev => prev == 'clock-in' ? 'text' : null,
    name: 'clockInDate',
    message: 'Enter clock-in date (YYYY-MM-DD or DDD)'
  }
]

export const booleanPrompt = ({name, message, initial}) => {
  return {
    type: 'confirm',
    name,
    message,
  }
}

export const multiSelectPrompt = ({ name, message, choices, maxSelection, hint }) => {
  return {
    type: 'multiselect',
    name,
    message,
    choices,
    max: maxSelection,
    hint,
    instructions: false
  }
}

export const selectPrompt = ({ name, message, choices, hint }) => {
  return {
    type: 'select',
    name,
    message,
    choices,
    hint,
    instructions: false
  }
}

export const textPrompt = ({name, message, initial}) => {
  return {
    type: 'text',
    name,
    message,
    initial,
  }
}

export const numberPrompt = ({name, message, initial, min, max}) => {
  return {
    type: 'number',
    name,
    message,
    initial,
    style: 'default',
    min,
    max
  }
}
