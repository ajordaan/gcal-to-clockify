import fs from 'fs'
import prompts from 'prompts';

export default class ClockifyUpdater {

  constructor(date, clockifyProjectId, calendarEvents, previouslyCategorisedEvents, clockifyTaskNames) {
    this.calendarEvents = calendarEvents
    this.previouslyCategorisedEvents = previouslyCategorisedEvents
    this.updatedCategorisedEvents = {}
    this.clockifyTaskNames = clockifyTaskNames
    this.clockifyTaskNames.push('ignore')
    this.targetDate = date
    this.clockifyProjectId = clockifyProjectId
  }

  async categoriseUnknownEvents() {

    const taskTypeChoices = this.clockifyTaskNames.sort().map(taskType => { return { title: taskType, value: taskType } })

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

  saveUpdatedCategorisedEvents() {
    fs.writeFileSync('config/calendar-event-types.json', JSON.stringify(this.updatedCategorisedEvents))
  }

  async clockifyHasExistingEntries() {
    const currentClockifyEntries = await getTimeEntries(this.clockifyProjectId, this.workDay.start.toISOString(), this.workDay.end.toISOString())

    return currentClockifyEntries.length > 0
  }

  get unknownCalendarEvents() {
    return this.calendarEvents.filter(event => !this.previouslyCategorisedEvents[event.summary])
  }

  get ignoredCalendarEvents() {
    return Object.keys(this.updatedCategorisedEvents).filter(eventName => [eventName] === 'ignore')
  }

  get validCalendarEvents() {
    return this.updatedCategorisedEvents.filter(event => !this.ignoredCalendarEvents.includes(event.summary))
  }

  get developmentEvents() {
    const gaps = getGapsInCalendarSchedule(this.validCalendarEvents, this.workDay)
    return gaps.map(gap => { return { summary: 'development', start: { dateTime: gap.start }, end: { dateTime: gap.end } } })
  }

  set calendarEvents(events) {
    this.calendarEvents = events
  }

  set previouslyCategorisedEvents(events) {
    this.previouslyCategorisedEvents = events
  }

  set date(d) {
    this.targetDate = d
  }

  get workDay() {
    return {
      start: new Date(`${targetDate.toISOString().split('T')[0]} ${WORK_DAY_START_TIME}`),
      end: new Date(`${targetDate.toISOString().split('T')[0]} ${WORK_DAY_END_TIME}`)
    }
  }

  addTimeEntry(eventCategory, event) {
    addTimeEntryFor(eventCategory, new Date(event.start.dateTime).toISOString(), new Date(event.end.dateTime).toISOString())
    console.log(`Added a ${eventCategory} entry for ${event.summary} (${timeInHoursMinutes(new Date(event.start.dateTime))} - ${timeInHoursMinutes(new Date(event.end.dateTime))})`)
  }

  async updateClockify(date) {
    const targetDate = date

    console.log(`Adding time entries for ${workDay.start.toString()}`)

    if (this.clockifyHasExistingEntries()) {
      console.error('Existing time entries found, exiting')
      return
    }

    if (this.calendarEvents.length == 0) {
      console.error('No calendar events found');
      return;
    }

    const newCategorisedEvents = await this.categoriseUnknownEvents()

    this.updatedCategorisedEvents = { ...this.previouslyCategorisedEvents, ...newCategorisedEvents }
    try {
      this.saveUpdatedCategorisedEvents()
      console.log('Updated saved events config')
    }
    catch (err) {
      console.error(err)
      console.log('Unable to store events. Exiting to avoid events not being uploaded correctly')
      return;
    }

    try {
      this.validCalendarEvents.forEach(event => {
        const eventCategory = this.updatedCategorisedEvents[event.summary]
        this.addTimeEntry(eventCategory, event)
      })

      developmentEvents.forEach(devEvent => {
        this.addTimeEntry('development', devEvent)
      })
    } catch (error) {
      console.error(error)
    }
  }
}
