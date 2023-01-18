import { calendar, getEvents, getEventsForToday } from './GoogleCalendarAPI.js';
import { addTimeEntryFor, getTimeEntries } from './ClockifyAPI.js'

import { getGapsInCalendarSchedule, currentWorkDay, WORK_DAY_END_TIME, WORK_DAY_START_TIME, title } from './Utils.js'

import yargs from 'yargs/yargs';

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

  if (events.length == 0) {
    console.error('No calendar events found');
    return;
  }

  const EVENT_TYPES = {
    'Daily Standup': 'ceremony',
    'Consumer Review & Planning': 'ceremony',
    'Development': 'development',
    'Front-End Session': 'development',
    'Core Planning': 'ceremony',
    'Howler // Weekly Project Review': 'ceremony'
  }

  const IGNORED_EVENTS = ['Front-End Session', 'Working']
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

