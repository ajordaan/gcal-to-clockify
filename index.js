import Setup from './setup.js'
import { title } from './Utils.js'
import prompts from 'prompts';
import { mainMenuPrompts } from './Prompter.js'
import { combineTimeAndDate } from './Utils.js'
import ClockifyUpdater from './ClockifyUpdater.js';
import * as dotenv from 'dotenv'

const checkmarkIcon = "✅"
const crossIcon = "❌"

const clockIn = async(setup) => {
if(!setup.setupComplete()) {
  console.log("Please run setup before clocking in")
  return
}
  const googleCalendarAPI = setup.getGoogleCalendarAPI()
  const workDayTimes = setup.getClockifyConfig().workDay
  const workDay = combineTimeAndDate(workDayTimes.startTime, workDayTimes.endTime, setup.targetDate)
  const calendarEvents = await googleCalendarAPI.getEvents(workDay.start, workDay.end)
  const clockifyUpdater = new ClockifyUpdater(setup, calendarEvents, workDay)
  clockifyUpdater.updateClockify()
}

(async () => {
  dotenv.config()
  console.log(title)
  let exit = false

  const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY
  const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL
  const GOOGLE_PROJECT_NUMBER = process.env.GOOGLE_PROJECT_NUMBER
  const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID
  const CLOCKIFY_API_KEY = process.env.CLOCKIFY_API_KEY


  const response = await prompts(mainMenuPrompts);

  const setup = new Setup(CLOCKIFY_API_KEY, { GOOGLE_PRIVATE_KEY, GOOGLE_CLIENT_EMAIL, GOOGLE_PROJECT_NUMBER, GOOGLE_CALENDAR_ID })
  switch (response.action) {
    case 'clock-in':
      const targetDate = response.clockInDate ? new Date(response.clockInDate) : new Date()
      setup.setTargetDate(targetDate)
      await clockIn(setup)
      break
    case 'Check status of current week':
      break
    case 'Add custom time entry':
      break
    case 'setup':
      setup.runSetup()
      break
    case 'exit':
      break
  }
})();

