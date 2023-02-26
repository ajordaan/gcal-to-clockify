import prompts from 'prompts'
import fs from 'fs'
import { multiSelectPrompt , numberPrompt, textPrompt } from './Prompter.js'
import ClockifyAPI from './ClockifyAPI.js';
import GoogleCalendarAPI from './GoogleCalendarAPI.js'

export default class Setup {

  constructor(clockifyApiKey, googleConfig) {
    this.clockifyApiKey = clockifyApiKey
    this.googleConfig = googleConfig
    this.categorisedEventsFilePath = 'config/categorised-events.json'
    this.configFilePath = 'config/clockify.json'
  }

  setTargetDate(date) {
    this.targetDate = date
  }

  getClockifyConfig() {
    return JSON.parse(fs.readFileSync(this.configFilePath))
  }

  setupComplete() {
    const configProps = [
      this.googleConfig.GOOGLE_PRIVATE_KEY,
      this.googleConfig.GOOGLE_CLIENT_EMAIL,
      this.googleConfig.GOOGLE_PROJECT_NUMBER,
      this.googleConfig.GOOGLE_CALENDAR_ID,
      this.clockifyApiKey
    ]
    return configProps.every(prop => prop !== null && prop !== undefined)
  }

  getClockifyAPI() {
    return new ClockifyAPI(this.clockifyApiKey)
  }

  getGoogleCalendarAPI() {
    return new GoogleCalendarAPI(this.googleConfig.GOOGLE_PRIVATE_KEY, this.googleConfig.GOOGLE_CLIENT_EMAIL, this.googleConfig.GOOGLE_PROJECT_NUMBER, this.googleConfig.GOOGLE_CALENDAR_ID)
  }

  getPreviouslyCategorisedEvents() {
    if(fs.existsSync(this.categorisedEventsFilePath)) {
      const previouslyCategorisedEventsFile = fs.readFileSync(this.categorisedEventsFilePath)

      return previouslyCategorisedEventsFile.length > 2 ? JSON.parse(previouslyCategorisedEventsFile) : []
    } 

    return []
  }

  saveCategorisedEvents(events) {
    fs.writeFileSync(this.categorisedEventsFilePath, JSON.stringify(events))
  }

  workDay() {
    const WORK_DAY_START_TIME = '09:00'
    const WORK_DAY_END_TIME = '17:00'

    return {
      start: new Date(`${this.targetDate.toISOString().split('T')[0]} ${WORK_DAY_START_TIME}`),
      end: new Date(`${this.targetDate.toISOString().split('T')[0]} ${WORK_DAY_END_TIME}`)
    }
  }

  async runSetup() {
    const config = {}

    config.activeTasks = await this.selectActiveClockifyTasks()
    const workDayTimes = await this.setStartAndEndTime()
    config.workDay = {}
    config.workDay.startTime = workDayTimes.start
    config.workDay.endTime = workDayTimes.end
    this.updateConfig(config)
  }

  async getStartAndEndOfWorkDay() {
  }

  async setStartAndEndTime() {
    const workDayStartTimePrompt = textPrompt({ name: 'start', message: 'Enter your work day start time in HH:MM (eg 09:00)' }) 
    const workDayEndTimePrompt = textPrompt({ name: 'end', message: 'Enter your work day end time in HH:MM (eg 17:00)' }) 

    const responses = await prompts([workDayStartTimePrompt, workDayEndTimePrompt])

    console.log({responses})

    return responses
  }

  async selectActiveClockifyTasks() {
    const clockifyApi = this.getClockifyAPI()
    const projects = await clockifyApi.getAllProjectsWithTasks()
    const activeTasks = []
    console.log('Choose what tasks you want available for each of your projects')
    const projectsWithSelectedTasks = {}
    for (const project of projects) {
      const choices = project.tasks.map(task => ({ title: task.name, value: {id: task.id, projectId: task.projectId, name: task.name, projectName: project.name, workspaceId: task.workspaceId}}))

      const prompt = multiSelectPrompt({
        name: project.name,
        message: `Select the tasks you want available for ${project.name}`,
        choices,
        maxSelection: project.tasks.length,
        hint: '- Space to select. Return to submit',
      })

      const response = await prompts(prompt)

      activeTasks.push(...response[project.name])
    }

    console.log({activeTasks})

    return activeTasks
  }

  updateConfig(config) {
    fs.writeFileSync('config/clockify.json', JSON.stringify(config))
  }
}
