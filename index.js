import { calendar, getEvents, getEventsForToday } from './GoogleCalendarAPI.js';
import { addTimeEntryFor, getTimeEntries, CLOCKIFY_TASKS } from './ClockifyAPI.js'
import fs from 'fs'
import prompts from 'prompts';
import { getGapsInCalendarSchedule, currentWorkDay, WORK_DAY_END_TIME, WORK_DAY_START_TIME, title } from './Utils.js'

const categoriseUnknownEvents = async (events, event_types, taskTypes) => {

  const taskTypeChoices = taskTypes.sort().map(taskType => { return { title: taskType, value: taskType } })
  const unknownEvents = events.filter(event => !event_types[event.summary])

  const categorisedEventQuestions = unknownEvents.map(event => {
    return {
      type: 'select',
      name: event.summary,
      message: `What category is: ${event.summary}`,
      choices: taskTypeChoices
    }
  })

  const responses = await prompts(categorisedEventQuestions);

  return responses
}

const saveCategorisedEvents = (events) => fs.writeFileSync('config/calendar-event-types.json', JSON.stringify(events))

const timeInHoursMinutes = (date) => `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`

const updateClockify = async (date) => {
  const targetDate = date
  const workDay = {
    start: new Date(`${targetDate.toISOString().split('T')[0]} ${WORK_DAY_START_TIME}`),
    end: new Date(`${targetDate.toISOString().split('T')[0]} ${WORK_DAY_END_TIME}`)
  }

  console.log(`Adding time entries for ${workDay.start.toString()}`)

  const currentClockifyEntries = await getTimeEntries('61c04d29f526e061858f97c6', workDay.start.toISOString(), workDay.end.toISOString())

  if (currentClockifyEntries.length > 0) {
    console.log({ currentClockifyEntries: currentClockifyEntries.length })
    console.error('Existing time entries found, exiting')
    return
  }

  const events = await getEvents(workDay.start, workDay.end)
  // const events = JSON.parse(fs.readFileSync('./google-calendar-events-stub.json'))

  if (events.length == 0) {
    console.error('No calendar events found');
    return;
  }

  let EVENT_TYPES = JSON.parse(fs.readFileSync('config/calendar-event-types.json'))
  const taskTypes = Object.keys(CLOCKIFY_TASKS)
  taskTypes.push('ignore')

  const newCategorisedEvents = await categoriseUnknownEvents(events, EVENT_TYPES, taskTypes)

  EVENT_TYPES = { ...EVENT_TYPES, ...newCategorisedEvents }
  try {
    saveCategorisedEvents(EVENT_TYPES)
    console.log('Updated saved events config')
  }
  catch (err) {
    console.error(err)
    console.log('Unable to store events. Exiting to avoid events not being uploaded correctly')
    return;
  }

  const IGNORED_EVENTS = Object.keys(EVENT_TYPES).filter(eventName => EVENT_TYPES[eventName] === 'ignore')
  const filteredEvents = events.filter(event => !IGNORED_EVENTS.includes(event.summary))
  const gaps = getGapsInCalendarSchedule(filteredEvents, workDay)
  const developmentEvents = gaps.map(gap => { return { summary: 'development', start: { dateTime: gap.start }, end: { dateTime: gap.end } } })

  try {
    filteredEvents.forEach(event => {
      if (EVENT_TYPES[event.summary]) {
        addTimeEntryFor(EVENT_TYPES[event.summary], new Date(event.start.dateTime).toISOString(), new Date(event.end.dateTime).toISOString())
        console.log(`Added a ${EVENT_TYPES[event.summary]} entry for ${event.summary} (${timeInHoursMinutes(new Date(event.start.dateTime))} - ${timeInHoursMinutes(new Date(event.end.dateTime))})`)
      }
    })

    developmentEvents.forEach(devEvent => {
      addTimeEntryFor('development', new Date(devEvent.start.dateTime).toISOString(), new Date(devEvent.end.dateTime).toISOString())
      console.log(`Added a development entry (${timeInHoursMinutes(new Date(devEvent.start.dateTime))} - ${timeInHoursMinutes(new Date(devEvent.end.dateTime))})`)
    })
  } catch (error) {
    console.error(error)
  }
}

(async () => {
  console.log(title)
  const questions = [
    {
      type: 'select',
      name: 'action',
      message: 'Choose an action',
      choices: [
        { title: 'Clock In', value: 'clock-in' },
        { title: 'Add custom time entry', value: 'custom-entry' },
        { title: 'Setup', value: 'setup' }
      ]
    },
    {
      type: prev => prev == 'clock-in' ? 'text' : null,
      name: 'clockInDate',
      message: 'Enter clock-in date (YYYY-MM-DD). Leave blank for today\'s date'
    }
  ]
  const response = await prompts(questions);

  switch (response.action) {
    case 'clock-in':
      const date = response.clockInDate ? new Date(response.clockInDate) : new Date()
      updateClockify(date)
  }
})();

