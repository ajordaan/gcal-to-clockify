import fs from 'fs'
import prompts from 'prompts';
import { WORK_DAY_START_TIME, WORK_DAY_END_TIME, getGapsInCalendarSchedule , timeInHoursMinutes} from './Utils.js';

export default class ClockifyUpdater {

  constructor(date, calendarEvents, previouslyCategorisedEvents, activeTasks, clockifyAPI, setup, fillInGaps) {
    this.clockifyAPI = clockifyAPI
    this.setup = setup
    this.calendarEvents = calendarEvents
    this.previouslyCategorisedEvents = previouslyCategorisedEvents
    this.activeTasks = activeTasks
    this.updatedCategorisedEvents = {}

    this.targetDate = date
  }

  async categoriseUnknownEvents(clockifyTasks) {
    const taskTypeChoices = clockifyTasks.map(task => ( { title: `${task.name} (${task.projectName})`, value: task.id } )).sort((a,b) => a.title > b.title ? 1 : -1)
    taskTypeChoices.push({title: 'ignore', value: 'ignore'})

    const categorisedEventQuestions = this.unknownCalendarEvents.map(event => {
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

  async clockifyHasExistingEntries() {
    const currentClockifyEntries = await this.clockifyAPI.getTimeEntries(this.workDay.start.toISOString(), this.workDay.end.toISOString())

    return currentClockifyEntries.length > 0
  }

  get unknownCalendarEvents() {
    return this.calendarEvents.filter(event => !this.previouslyCategorisedEvents[event.summary])
  }

  get ignoredCalendarEvents() {
    return Object.keys(this.updatedCategorisedEvents).filter(eventName => this.updatedCategorisedEvents[eventName] === 'ignore')
  }

  get validCalendarEvents() {
    return this.calendarEvents.filter(event => !this.ignoredCalendarEvents.includes(event.summary))
  }

  get developmentEvents() {
    const gaps = getGapsInCalendarSchedule(this.validCalendarEvents, this.workDay)
    return gaps.map(gap => { return { summary: 'development', start: { dateTime: gap.start }, end: { dateTime: gap.end } } })
  }

  set date(d) {
    this.targetDate = d
  }

  get workDay() {
    const WORK_DAY_START_TIME = '09:00'
    const WORK_DAY_END_TIME = '17:00'
    return {
      start: new Date(`${this.targetDate.toISOString().split('T')[0]} ${WORK_DAY_START_TIME}`),
      end: new Date(`${this.targetDate.toISOString().split('T')[0]} ${WORK_DAY_END_TIME}`)
    }
  }

  async addTimeEntry(task, event, message) {
    await this.clockifyAPI.addTimeEntry(task, new Date(event.start.dateTime).toISOString(), new Date(event.end.dateTime).toISOString())
    console.log(message)
  }

  async updateClockify(date) {
    if(!setup.setupComplete()) {
      console.log('Please run setup before clocking in')
      return
    }

    const targetDate = date

    console.log(`Adding time entries for ${this.workDay.start.toString()}`)

    const existingEntries = await this.clockifyHasExistingEntries()
    if (existingEntries) {
      console.error('Existing time entries found, exiting')
      return
    }

    if (this.calendarEvents.length == 0) {
      console.error('No calendar events found');
      return;
    }

    const newCategorisedEvents = await this.categoriseUnknownEvents(this.activeTasks)

    this.updatedCategorisedEvents = { ...this.previouslyCategorisedEvents, ...newCategorisedEvents }

    if(Object.keys(newCategorisedEvents).length > 1) {
      try {
        this.setup.saveCategorisedEvents(this.updatedCategorisedEvents)
        console.log('Updated saved events config')
      }
      catch (err) {
        console.error(err)
        console.log('Unable to store events. Exiting to avoid events not being uploaded correctly')
        return;
      }
    }

    try {
      for(const event of this.validCalendarEvents) {
        const eventTaskId = this.updatedCategorisedEvents[event.summary]
        const eventTask = this.activeTasks.find(task => task.id === eventTaskId)
        await this.addTimeEntry(eventTask, event, `Added a ${eventTask.name} entry for ${event.summary} (${timeInHoursMinutes(new Date(event.start.dateTime))} - ${timeInHoursMinutes(new Date(event.end.dateTime))})`)
      }

      if(fillInGaps) {
        const developmentTask = this.activeTasks.find(task => task.name === 'Development')
        for(const devEvent of this.developmentEvents) {
          await this.addTimeEntry(developmentTask, devEvent, `Added a ${developmentTask.name} entry (${timeInHoursMinutes(new Date(devEvent.start.dateTime))} - ${timeInHoursMinutes(new Date(devEvent.end.dateTime))})`)
        }
      }

      console.log('Finished adding entries, please confirm they are correct on clockify: https://app.clockify.me/calendar')
    } catch (error) {
      console.error(error)
    }
  }
}
