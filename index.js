import GoogleCalendarAPI from './GoogleCalendarAPI.js'
import fs from 'fs'
import { title } from './Utils.js'
import prompts from 'prompts';
import { mainMenuPrompts } from './Prompter.js'
import ClockifyUpdater from './ClockifyUpdater.js';
import ClockifyAPI from './ClockifyAPI.js';
import * as dotenv from 'dotenv'
const setupComplete = (configProps) => {
  return configProps.every(prop => prop !== null && prop !== undefined)
}

const setup = () => {
  const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY
  const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL
  const GOOGLE_PROJECT_NUMBER = process.env.GOOGLE_PROJECT_NUMBER
  const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID
  const CLOCKIFY_API_KEY = process.env.CLOCKIFY_API_KEY
}

const clockIn = (response) => {

  const clockifyConfig = JSON.parse(fs.readFileSync('./config/clockify.json'))

  const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY
  const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL
  const GOOGLE_PROJECT_NUMBER = process.env.GOOGLE_PROJECT_NUMBER
  const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID
  const CLOCKIFY_API_KEY = process.env.CLOCKIFY_API_KEY

  const googleCalendarAPI = new GoogleCalendarAPI(GOOGLE_PRIVATE_KEY, GOOGLE_CLIENT_EMAIL, GOOGLE_PROJECT_NUMBER, GOOGLE_CALENDAR_ID)
  const clockifyAPI = new ClockifyAPI(CLOCKIFY_API_KEY, clockifyConfig.userID,)

  const configProps = [GOOGLE_PRIVATE_KEY, GOOGLE_CLIENT_EMAIL, GOOGLE_PROJECT_NUMBER, GOOGLE_CALENDAR_ID, clockifyConfig.userID, clockifyConfig.workspaceId]

  if (!setupComplete(configProps)) {
    console.error('Config properties missing. Please run the setup option first.')
    return
  }
  const targetDate = response.clockInDate ? new Date(response.clockInDate) : new Date()
  const projectId = '61c04d29f526e061858f97c6'
  const workDay = {
    start: new Date(`${targetDate.toISOString().split('T')[0]} ${WORK_DAY_START_TIME}`),
    end: new Date(`${targetDate.toISOString().split('T')[0]} ${WORK_DAY_END_TIME}`)
  }

  const calendarEvents = googleCalendarAPI.getEvents(workDay.start, workDay.end)
  const previouslyCategorisedEventsFile = fs.readFileSync('config/calendar-event-types.json')

  const previouslyCategorisedEvents = previouslyCategorisedEventsFile.length > 2 ? JSON.parse(previouslyCategorisedEventsFile) : []

  const clockifyTasks = clockifyAPI.getProjectTasks(clockify.workspaceId, clockifyConfig.projectId)

  const clockifyUpdater = new ClockifyUpdater(date, projectId, calendarEvents, previouslyCategorisedEvents,)
}

(async () => {
  dotenv.config()
  console.log('test')
  console.log(title)
  let exit = false

  const response = await prompts(mainMenuPrompts);

  switch (response.action) {
    case 'clock-in':
      clockIn(response)
      break
    case 'setup':
      setup()
      break
    case 'exit':
      break
  }
})();

