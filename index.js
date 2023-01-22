import { calendar, getEvents, getEventsForToday } from './GoogleCalendarAPI.js';
import { addTimeEntryFor, getTimeEntries, CLOCKIFY_TASKS } from './ClockifyAPI.js'
import fs from 'fs'
import readline from 'readline'
import { getGapsInCalendarSchedule, currentWorkDay, WORK_DAY_END_TIME, WORK_DAY_START_TIME, title } from './Utils.js'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));

import yargs from 'yargs/yargs';

const categoriseUnknownEvents = async (events, event_types) => {

  console.log('categorising events')
  const taskTypes = Object.keys(CLOCKIFY_TASKS)
  taskTypes.push('ignore')

  console.log({taskTypes})

  const unknownEvents = events.filter(event => !event_types[event.summary])

  // console.log({unknownEvents})


  const categorised = {}

  for (const event of unknownEvents) {
    console.log(`What type of event is: ${event.summary}`)
    
    taskTypes.forEach((task, i) => console.log(`${i+1}. ${task}`) )

    const typeIndex = await prompt("Type: ");

    console.log('selected: ' + typeIndex)

    categorised[event.summary] = taskTypes[typeIndex - 1]

  }

  return categorised
}

const saveCategorisedEvents = (events) => fs.writeFileSync('config/calendar-event-types.json', JSON.stringify(events))

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

  // const events = await getEvents(workDay.start, workDay.end)
  const events = JSON.parse(fs.readFileSync('./google-calendar-events-stub.json'))

  if (events.length == 0) {
    console.error('No calendar events found');
    return;
  }

  const taskTypes = Object.keys(CLOCKIFY_TASKS).map(task => task.name)
  taskTypes.push('Ignore')


  let EVENT_TYPES = JSON.parse(fs.readFileSync('config/calendar-event-types.json'))
  const newCategorisedEvents = await categoriseUnknownEvents(events, EVENT_TYPES)

  EVENT_TYPES = {...EVENT_TYPES, ...newCategorisedEvents}

  saveCategorisedEvents(EVENT_TYPES)

  const IGNORED_EVENTS = Object.keys(EVENT_TYPES).filter(eventName => EVENT_TYPES[eventName] === 'ignore')
  const filteredEvents = events.filter(event => !IGNORED_EVENTS.includes(event.summary))

  const gaps = getGapsInCalendarSchedule(filteredEvents, workDay)
  const developmentEvents = gaps.map(gap => { return { summary: 'Development', start: { dateTime: gap.start }, end: { dateTime: gap.end } } })
  events.push(...developmentEvents)

  try {
    filteredEvents.forEach(event => {
      if (EVENT_TYPES[event.summary]) {
        addTimeEntryFor(EVENT_TYPES[event.summary], new Date(event.start.dateTime).toISOString(), new Date(event.end.dateTime).toISOString())
        console.log(`Added a ${EVENT_TYPES[event.summary]} entry for ${event.summary}`)
      }
    })
  } catch (error) {
    console.error(error)
  }

}

yargs(process.argv.slice(2))
  .scriptName("Calendar to Clockify Uploader")
  .usage('$0 <cmd> [args]')
  .command('clock-in [date]', 'Upload calendar events as clockify time entries', (yargs) => {
    yargs.positional('date', {
      type: 'string',
      default: null,
      describe: 'The date you want to upload events from (YYYY-MM-DD)'
    })
  }, (argv) => {
    const date = argv.date ? new Date(argv.date) : new Date()
    console.log(title)
    updateClockify(date)
  })
  .help()
  .argv

