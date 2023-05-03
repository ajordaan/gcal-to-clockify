import { getDateFromWeekDayName, getStartOfWeek, title } from './Utils.js'
import { mainMenuPrompts, textPrompt } from './Prompter.js'
import { combineTimeAndDate } from './Utils.js'
import ClockifyUpdater from './ClockifyUpdater.js';
import * as dotenv from 'dotenv'

const checkmarkIcon = "✅"
const crossIcon = "❌"

const clockIn = async(setup, prompts) => {
if(!setup.setupComplete()) {
  console.log("Please run setup before clocking in")
  return
}
  const googleCalendarAPI = setup.getGoogleCalendarAPI()
  const workDayTimes = setup.getClockifyConfig().workDay
  const workDay = combineTimeAndDate(workDayTimes.startTime, workDayTimes.endTime, setup.targetDate)
  const calendarEvents = await googleCalendarAPI.getEvents(workDay.start, workDay.end)
  const clockifyUpdater = new ClockifyUpdater(setup, calendarEvents, workDay, prompts)
  await clockifyUpdater.updateClockify()
}

const statusOfCurrentWeek = async(setup) => {

  const workDayTimes = setup.getClockifyConfig().workDay

  const monday = getStartOfWeek(new Date())
  const clockifyAPI = setup.getClockifyAPI()
  const currDate = monday
  
  console.log('NOTE: This only checks if there are any entries during your work hours, it doesn\'t mean the entries are complete/correct\n')

  for(let i = 0; i < 5; i++) {
    const workDay = combineTimeAndDate(workDayTimes.startTime, workDayTimes.endTime, currDate)
    const weekday = currDate.toLocaleDateString('en-ZA', { weekday: 'long' }); 

    const entries = await clockifyAPI.getTimeEntries(workDay.start.toISOString(), workDay.end.toISOString())
    const status = entries.length > 0 ? checkmarkIcon : crossIcon
    
    console.log(`${weekday}: ${status}`)
    currDate.setDate(currDate.getDate() + 1)
  }
}

const customTimeEntry = async(setup) => {

  const clockifyAPI = setup.getClockifyAPI()
  const clockifyTasks = setup.getClockifyConfig().activeTasks
  const taskTypeChoices = clockifyTasks
    .map(task => ( { title: `${task.name} (${task.projectName})`, value: task.id } ))
    .sort((a,b) => a.title > b.title ? 1 : -1)

  const taskTypePrompt =  {
    type: 'select',
    name: 'taskType',
    message: 'What category is this entry?',
    choices: taskTypeChoices
  }

  const entryStartTimePrompt = textPrompt({ name: 'start', message: 'Entry start time in HH:MM (eg 09:00)' }) 
  const entryEndTimePrompt = textPrompt({ name: 'end', message: 'Entry end time in HH:MM (eg 17:00)' }) 

  const response = await prompts([taskTypePrompt, entryStartTimePrompt, entryEndTimePrompt]);

  console.log({response})

  // await clockifyAPI.addTimeEntry(task, new Date(startTime).toISOString(), new Date(endTime).toISOString())
}

export const mainMenu = async(prompts, setup) => {
  console.log(title)
  let exit = false

  const response = await prompts(mainMenuPrompts);

  switch (response.action) {
    case 'clock-in':
      let targetDate = null
      if (response.clockInDate) {
        if (response.clockInDate.length === 3) {
          targetDate = getDateFromWeekDayName(response.clockInDate)
        }
        else {
          targetDate = new Date(response.clockInDate)
        }
      }
      else {
        targetDate = new Date()
      }
      setup.setTargetDate(targetDate)
      await clockIn(setup, prompts)
      break
    case 'status':
      await statusOfCurrentWeek(setup)
      break
    case 'custom-entry':
      await customTimeEntry(setup)
      break
    case 'setup':
      setup.runSetup()
      break
    case 'exit':
      break
  }
};

