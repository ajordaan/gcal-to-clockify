import * as dotenv from 'dotenv'
import fs from 'fs'
dotenv.config()

import got from 'got';

export default class ClockifyAPI {
  constructor(apiKey, userId, workspaceId) {
    this.USER_ID = userId
    this.WORKSPACE_ID = workspaceId
    this.API_KEY = apiKey

    const options = {
      prefixUrl: 'https://api.clockify.me/api/v1',
      headers: {
        'X-Api-Key': this.API_KEY
      },
      timeout: {
        request: 10000
      }
    }
    this.client = got.extend(options)
  }

  async getUserInfo() {
    const url = `user`
    const res = await this.client.get(url)
    return JSON.parse(res)
  }

  async addTimeEntry(task, start, end) {
    const url = `workspaces/${task.workspaceId}/time-entries`
    const options = {
      json: {
        projectId: task.projectId,
        taskId: task.id,
        start,
        end
      }
    }
    const res = await this.client.post(url, options)

    return res.statusCode
  }

  async addTimeEntryFor(taskType, start, end) {
    return addTimeEntry(CLOCKIFY_TASKS[taskType], start, end)
  }

  async getWorkspaceProjects() {
    const url = `/workspaces/${this.WORKSPACE_ID}/projects`

    const res = await this.client.get(url)

    return JSON.parse(res)
  }

  async getProjectTasks(projectId) {
    const url = `/workspaces/${this.WORKSPACE_ID}/projects/${projectId}/tasks`

    const res = await this.client.get(url)
    const tasks = JSON.parse(res.body)

    return tasks.map(task => { return { workspaceId, ...task } })
  }

  async getTimeEntries(workspaceId, startTime, endTime) {

    const url = `workspaces/${workspaceId}/user/${this.USER_ID}/time-entries?start=${startTime}&end=${endTime}`

    const res = await this.client.get(url)
    return JSON.parse(res.body)
  }

  async getTimeEntriesForToday(taskId, projectId, workspaceId) {
    const today = new Date()
    const startDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()} ${DAY_START_TIME}`
    const endDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()} ${DAY_END_TIME}`

    return getTimeEntries(taskId, projectId, workspaceId, startDate, endDate)
  }
}


