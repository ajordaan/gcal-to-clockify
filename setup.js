import prompts from 'prompts'
import fs from 'fs'
import { multiSelectPrompt , numberPrompt} from './Prompter.js'
export default class Setup {

  constructor(clockifyAPI) {
    this.clockifyAPI = clockifyAPI
  }

  async runSetup() {
    const config = {}

    config.activeTasks = await this.selectActiveClockifyTasks()
    config.activeWorkspace = await this.getActiveWorkspace()
  }

  async getActiveWorkspace() {
    const userInfo = await this.clockifyAPI.getUserInfo()
    return userInfo.activeWorkspace

  }

  async getStartAndEndOfWorkDay() {
    
  }

  async selectActiveClockifyTasks(projects) {
    console.log('Choose what tasks you want available for each of your projects')
    const projectsWithSelectedTasks = {}
    for (const project of projects) {
      const choices = project.tasks.map(task => ({ title: task.name, value: task.name }))

      const prompt = multiSelectPrompt({
        name: project.name,
        message: `Select the tasks you want available for ${project.name}`,
        choices,
        maxSelection: project.tasks.length,
        hint: '- Space to select. Return to submit',
      })

      const response = await prompts(prompt)

      projectsWithSelectedTasks[project.name] = response[project.name]

    }

    return projectsWithSelectedTasks
  }

  updateConfig(config) {
    fs.writeSync('config/clockify.js', JSON.stringify(config))
  }
}
