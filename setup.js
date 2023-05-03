import fs from 'fs'
import { booleanPrompt, multiSelectPrompt , numberPrompt, textPrompt } from './Prompter.js'
import ClockifyAPI from './ClockifyAPI.js';
import GoogleCalendarAPI from './GoogleCalendarAPI.js'

export default class Setup {

  constructor(clockifyApiKey, googleConfig, prompts) {
    this.clockifyApiKey = clockifyApiKey
    this.googleConfig = googleConfig
    this.categorisedEventsFilePath = 'config/categorised-events.json'
    this.configFilePath = 'config/clockify.json'
    this.targetDate = null
    this.prompts = prompts
  }

  getClockifyConfig() {
    return JSON.parse(fs.readFileSync(this.configFilePath))
  }

  setupComplete() {
    if(fs.existsSync(this.configFilePath)) {
      const config = this.getClockifyConfig()

      return [config.activeTasks, config.workDay, config.fillInGaps].every(prop => prop !== null && prop != undefined)
    } else {
      return false
    }
  }

  setupAbleToRun() {
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

    return {}
  }

  saveCategorisedEvents(events) {
    fs.writeFileSync(this.categorisedEventsFilePath, JSON.stringify(events))
  }

  setTargetDate(date) {
    this.targetDate = date
  }

  async runSetup() {
    if(!this.setupAbleToRun()) {
      console.log('Missing env properties. Please add clockify API key and Google service account info to .env file')
      return;
    }
    const config = {}

    config.activeTasks = await this.selectActiveClockifyTasks()
    const workDayTimes = await this.setStartAndEndTime()

    config.workDay = {}
    config.workDay.startTime = workDayTimes.start
    config.workDay.endTime = workDayTimes.end
    config.fillInGaps = await this.setFillInScheduleGaps()
    if(config.fillInGaps) {
      config.fillTask = await this.setFillTask(config.activeTasks)
    }
    this.updateConfig(config)
    console.log('Setup complete!')

  }

  async setFillInScheduleGaps() {
    const fillInGaps = booleanPrompt({ name: 'fillInGaps', message: 'Do you want to automatically fill gaps in your schedule with a task?' })
    const response = await this.prompts(fillInGaps)
    return response.fillInGaps
  }

  async setFillTask(tasks) {
    const choices = tasks.map(task => ({ title: task.name, value: task.id}))
    const prompt = multiSelectPrompt({
      name: 'fillTask',
      message: 'Choose what task you want to fill the gaps in your schedule with',
      choices,
    })
    const response = await this.prompts(prompt)
    return response.fillTask
  }

  async setStartAndEndTime() {
    const workDayStartTimePrompt = textPrompt({ name: 'start', message: 'Enter your work day start time in HH:MM (eg 09:00)' }) 
    const workDayEndTimePrompt = textPrompt({ name: 'end', message: 'Enter your work day end time in HH:MM (eg 17:00)' }) 

    const responses = await this.prompts([workDayStartTimePrompt, workDayEndTimePrompt])

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

      const response = await this.prompts(prompt)
      activeTasks.push(...response[project.name])
    }

    return activeTasks
  }

  updateConfig(config) {
    fs.writeFileSync('config/clockify.json', JSON.stringify(config))
  }
}
