import { getGapsInCalendarSchedule , timeInHoursMinutes } from './Utils.js';

export default class ClockifyUpdater {

  constructor(setup, calendarEvents, workDay, prompts) {
    this.setup = setup
    this.clockifyAPI = setup.getClockifyAPI()
    this.calendarEvents = calendarEvents
    this.updatedCategorisedEvents = {}
    this.workDay = workDay
    this.activeTasks = this.setup.getClockifyConfig().activeTasks
    this.targetDate = setup.targetDate
    this.prompts = prompts
  }

  get fillInGaps() {
    return this.setup.getClockifyConfig().fillInGaps
  }

  get fillTaskId() {
    return this.setup.getClockifyConfig().fillTask
  }

  get previouslyCategorisedEvents() {
    return this.setup.getPreviouslyCategorisedEvents()
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

    const responses = await this.prompts(categorisedEventQuestions);

    return responses
  }

  async clockifyHasExistingEntries() {
    const currentClockifyEntries = await this.clockifyAPI.getTimeEntries(this.workDay.start.toISOString(), this.workDay.end.toISOString())

    return currentClockifyEntries.length > 0
  }


  async addTimeEntry(task, event, message) {
    await this.clockifyAPI.addTimeEntry(task, new Date(event.start.dateTime).toISOString(), new Date(event.end.dateTime).toISOString())
    console.log(message)
  }

  async updateClockify() {
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

    if(Object.keys(newCategorisedEvents).length > 0) {
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
      for (const event of this.validCalendarEvents) {
        const eventTaskId = this.updatedCategorisedEvents[event.summary]
        const eventTask = this.activeTasks.find(task => task.id === eventTaskId)
        await this.addTimeEntry(eventTask, event, `Added a ${eventTask.name} entry for ${event.summary} (${timeInHoursMinutes(new Date(event.start.dateTime))} - ${timeInHoursMinutes(new Date(event.end.dateTime))})`)
      }

      if(this.fillInGaps) {
        const developmentTask = this.activeTasks.find(task => task.id === this.fillTaskId)
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
